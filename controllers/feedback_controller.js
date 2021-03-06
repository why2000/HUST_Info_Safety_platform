var feedback = require('../models/feedback_db');
var course = require('../models/course_db');
var file = require('../models/file_db');
var user = require('../models/user_db');
var response = require('../utils/response');
var extname = require('path').extname;
var cfg = require('../config/feedback.json');
var fs = require('fs');
var UserValidator = require('../validators/user_validator');
let FeedbackLogger = require('../logger').FeedbackLogger;

/* 
    考虑添加一个全局的ErrorHandler(如果有这种玩意儿)
*/

const getStudentList = async (req, res) => {
    // if (req.session.loginUser && (await UserValidator.getUserTypeById(req.session.loginUser) == "teacher")) {

    let course_id = req.params.class_id;
    course.getStudentsByCourseID(course_id)
        .catch(err => {
            res.status(500).send("Server error");
            throw (err);
        })
        .then(async result => {
            let data = [];
            if (result) {
                for (let n = 0; n < result.length; n++) {
                    let stu = await user.findUserById(result[n]);

                    let report = await feedback.getReportByStudentIDAndModuleID(result[n], course_id)
                    let reportFileID;
                    if (report && report.length != 0) {
                        reportFileID = report.file_id;
                    } else {
                        reportFileID = false;
                    }
                    data.push({
                        id: result[n],
                        name: stu.username,
                        file_id: reportFileID
                    })
                }
                res.status(200).json(data);
            } else {
                res.status(500).send("No data");
            }
        })
    /* } else {
         res.status(401).send("permission denied");
     }*/
}

const getTeacherIndexPage = async (req, res) => {
    if (!req.session.loginUser) {
        res.redirect('/');
    } else {
        UserValidator.getUserTypeById(req.session.loginUser).then(user_type => {
            if (user_type == "teacher") {
                res.render("judge-upload");
            }
            res.redirect('/feedback/index/class');
        })
    }
}

const getPageByUserType = async (req, res) => {
    if (!req.session.loginUser) {
        res.redirect('/');
    } else {
        UserValidator.getUserTypeById(req.session.loginUser).then(user_type => {
            if (user_type == "student") {
                if (req.params.class_id != 'index') {
                    res.render('report-upload');
                } else {
                    res.render('report-index');
                }
            } else {
                res.render('judge-upload');
            }
        });
    }
}

const getStudentReport = async (req, res) => {
    console.log(req.session.loginUser)
    console.log(req.params.student_id)

    if (req.session.loginUser &&
        ((await UserValidator.getUserTypeById(req.session.loginUser) == "teacher")) ||
        (req.session.loginUser == req.params.student_id)) {

        feedback.getReportByStudentIDAndModuleID(req.params.student_id, req.params.course_id)
            .catch(err => {
                //need a logger
                response(res, 500, "Server error.");
            })
            .then(result => {
                if (result) {
                    response(res, result);
                } else {
                    res.status(400).send("No data");
                }
            });
    }
    else {
        res.status(401).send("permission denied");
    }
}

const getModuleReport = async (req, res) => {
    console.log(req.session.loginUser)
    console.log(req.params.student_id)

    if (req.session.loginUser &&
        ((await UserValidator.getUserTypeById(req.session.loginUser) == "teacher")) ||
        (req.session.loginUser == req.params.student_id)) {

        feedback.getReportsByModuleID( req.params.course_id)
            .catch(err => {
                //need a logger
                response(res, 500, "Server error.");
            })
            .then(result => {
                if (result) {
                    response(res, result);
                } else {
                    res.status(400).send("No data");
                }
            });
    }
    else {
        res.status(401).send("permission denied");
    }
}

const saveStudentReport = async (req, res) => {
    // 注意student_id和course_id是否存在
    // form内input file的id为upload
    let sid = req.session.loginUser;
    let mid = req.params.course_id;
    if (sid) {
        if (!req.file) { // 没上传文件
            response(res, 400, "Argument error.");
            return;
        }

        if (cfg.EXTENSIONS.indexOf(extname(req.file.originalname).toLowerCase()) == -1) { // 不在允许的扩展名内
            response(res, 400, 'File is not allowed to upload.');
            fs.unlink(req.file.path); // 删掉文件，其实感觉不太对，不应该放在这儿
            return;
        }


        feedback.getReportByStudentIDAndModuleID(sid, mid)
            .then(result => {
                if (result) {
                    // 注意，这里是异步
                    file.removeFile(result.file_id);
                }
                return file.saveFile(req.file.originalname, req.file.path, `student:${sid}`);
            })
            .then(fid => {
                return feedback.upsertReport(sid, mid, fid, req.file.originalname);
            })
            .then(() => {
                response(res, {});
            })
            .catch(err => {

                response(res, 500, 'Server error.');
            });
    } else {
        res.status(401).send("No Login.");
    }
}

const deleteStudentReport = async (req, res) => {
    let sid = req.params.student_id;
    let mid = req.params.course_id;
    let fid = req.params.file_id;
    if (sid) {
        feedback.getReportByStudentIDAndModuleID(sid, mid)
            .then(result => {
                if (result) {
                    feedback.removeReport(sid, mid, fid)
                        .then(() => {
                            file.removeFile(fid).catch(() => {}); // 不报错
                            response(res, {});
                        })
                        .catch(err => {
                            response(res, 500, 'Server error.');
                        });
                } else {
                    res.status(500).send("Not found.");
                }
            });
    } else {
        res.status(401).send("permission denied");
    }
}

const getAllTeacherJudgement = async (req, res) => {
    var mid = req.params.course_id;
    var sid = req.params.student_id;

    if (!req.session.loginUser) {
        response(res, 401, 'Not Login.');
        return;
    }

    if (await UserValidator.getUserTypeById(req.session.loginUser) == 'student' &&
        req.params.student_id != req.session.loginUser.toString()) { // 学生用户访问不是自己的
        response(res, 401, 'Permission denied.');
        return;
    }

    feedback.getAllJudgementByStudentIDAndModuleID(sid, mid)
        .then(r => {
            if (r) {
                response(res, r);
            } else {
                response(res, 404, 'Not found.')
            }
        })
        .catch(err => {
            FeedbackLogger.error(`controller error => ${err.stack}`)
            next(err);
        })
}


const getTeacherJudgement = async (req, res, next) => {
    if (!req.session.loginUser) {
        response(res, 401, 'Not Login.');
        return;
    }

    if (await UserValidator.getUserTypeById(req.session.loginUser) == 'student' &&
        req.params.student_id != req.session.loginUser.toString()) { // 学生用户访问不是自己的
        response(res, 401, 'Permission denied.');
        return;
    }


    try {
        var course_id = req.params.course_id;
        var student_id = req.params.student_id;
        var file_id = req.params.file_id;
        feedback.getJudgementByStudentIDAndModuleID(student_id, course_id, file_id).then(result => {
            if (result) {
                res.json({
                    result: {
                        info: {
                            score: result.score,
                            text: result.text
                        }
                    }
                })
            } else {
                res.json({
                    result: {
                        info: {
                            score: '',
                            text: ''
                        }
                    }
                })
            }
        });
    } catch (err) {
        FeedbackLogger.error(`controller error => ${err.stack}`)
        next(err);
    }
}

const saveTeacherJudgement = async (req, res) => {
    // 注意student_id和course_id是否存在
    let sid = req.params.student_id;
    let mid = req.params.course_id;
    let fid = req.params.file_id;

    if (req.session.loginUser && (await UserValidator.getUserTypeById(req.session.loginUser) == "teacher")) {

        // 参数类型检查和范围检查 其实很丑，看看有什么比较好看的解决方案
        if (typeof (req.body.score) == 'number' && typeof (req.body.body == 'string') && (req.body.score >= 0 && req.body.score <= 100)) {
            req.body.score = Math.floor(req.body.score);//取整
            // TODO: 有XSS攻击风险!!!
            let fname = await file.getFileNameByID(fid);
            if (!fname) {
                response(res, 404, 'File Not Found!');
                return;
            }

            feedback.upsertJudgement(sid, mid, fid, fname, req.body.score, req.body.text)
                .then(() => {
                    response(res, {});
                })
                .catch(err => {
                    response(res, 500, 'Server error.');
                });

        } else {
            response(res, 400, 'Data error.');
        }
    } else {
        response(res, 401, "Not Login.");
    }
}

const deleteTeacherJudgement = async (req, res) => {
    let sid = req.params.student_id;
    let mid = req.params.course_id;
    let fid = req.params.file_id;

    if (req.session.loginUser && (await UserValidator.getUserTypeById(req.session.loginUser) == "teacher")) {
        feedback.removeJudgement(sid, mid, fid)
            .then(() => {
                response(res, {});
            })
            .catch(err => {
                response(res, 500, 'Server error.');
            });
    } else {
        response(res, 401, "Permission denied.");
    }
}

module.exports = {
    getStudentList,
    getPageByUserType,
    getStudentReport,
    getModuleReport,
    saveStudentReport,
    deleteStudentReport,
    getAllTeacherJudgement,
    getTeacherJudgement,
    saveTeacherJudgement,
    deleteTeacherJudgement,
    getTeacherIndexPage
}