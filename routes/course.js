let express = require('express');
let router = express.Router();
let middleware = require('../utils/middleware');
let CourseController = require('../controllers/course_controller');

router.use(middleware.checkLogin)

router.get('/all', CourseController.getAllCourses)
router.get('/', CourseController.getCourses)
router.post('/', CourseController.createCourse)
router.delete('/:id', CourseController.removeCourse)
router.get('/:id/student', CourseController.getStudentsByCourseID)
router.get('/:id/teacher', CourseController.getTeacherByCourseID)
router.post('/:id/student', CourseController.addStudentsByCourseID)
router.post('/:id/teacher', CourseController.addTeacherByCOurseID)


module.exports = router;
