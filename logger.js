const winston = require('winston');

const ContactLogger = winston.createLogger({
    level: "verbose",
    transports: [
        new (winston.transports.File)({
            filename: 'logs/contact.log'
        }),
        new (winston.transports.Console)()
    ]
})

const UserLogger = winston.createLogger({
    level: "verbose",
    transports: [
        new (winston.transports.File)({
            filename: 'logs/user.log'
        }),
        new (winston.transports.Console)()
    ]
})

const ExamLogger = winston.createLogger({
    level: "verbose",
    transports: [
        new (winston.transports.File)({
            filename: 'logs/exam.log'
        }),
        new (winston.transports.Console)()
    ]
})

const TutorialLogger = winston.createLogger({
    level: "verbose",
    transports: [
        new (winston.transports.File)({
            filename: 'logs/tutorial.log'
        }),
        new (winston.transports.Console)()
    ]
})

const FeedbackLogger = winston.createLogger({
    level: "verbose",
    transports: [
        new (winston.transports.File)({
            filename: 'logs/feedback.log'
        }),
        new (winston.transports.Console)()
    ]
})

const CourseLogger = winston.createLogger({
    level: "verbose",
    transports: [
        new (winston.transports.File)({
            filename: 'logs/course.log'
        }),
        new (winston.transports.Console)()
    ]
})

const ExperimentLogger = winston.createLogger({
    level: "verbose",
    transports: [
        new (winston.transports.File)({
            filename: 'logs/experiment.log'
        }),
        new (winston.transports.Console)()
    ]
})

module.exports = {
    ContactLogger,
    UserLogger,
    ExamLogger,
    FeedbackLogger,
    TutorialLogger,
    CourseLogger,
    ExperimentLogger
}