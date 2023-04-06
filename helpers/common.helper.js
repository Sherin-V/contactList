const express = require('express');
const app = express();
const mysql = require('mysql');
const bodyParser = require('body-parser');
const cors = require('cors');
const compression = require('compression');
require('dotenv').config()

// const apiErrorHandler = defaultErrorHandlerMiddleware;
const setRoute = (routes) => {
    try {
        if (routes) {
            Object.keys(routes).forEach(routeName => {
                app.use(`/${routeName}`, routes[routeName].router);
                // console.log(`/${routeName}`);
                // console.log(routes[routeName].router);
                // console.log(routes[routeName].router.route);
            })
        }
    } catch (err) {
        console.log('Error - ', err);
    }
}

const use = fn => (req, res, next) =>{
     Promise.resolve(fn(req, res, next)).catch(console.log(next));
}
const defaultErrorHandlerMiddleware = (error, req, res, next) => {
    console.error(`Error Occured while processing api request ${req.url}: ${error}`);
    console.log(`Error Occured while processing api request ${req.url}: ${error}`);
    // console.log(`${error}, Received this error now need to be returned`);
    let errorObject = error;
    if (!(error instanceof ApplicationError)) {
        console.error(`Error Occured with the details as ${error}`);
        errorObject = new ApplicationError({location: __locationObject, errorObject: error});
    }
    res.json(errorObject.getErrorObject());
    return;
}
const   manageApiRequestMiddleWare = async (req, res, next) => {

    // let tenant;

    if (req) {
            // console.log('Token is not required now...', JSON.stringify(req));
            if (req.method === 'GET') {
                let criteria = {};
                if (req.query.criteria) {
                    criteria = JSON.parse(req.query.criteria);
                }
                if (!criteria['tenant']) {
                    criteria['tenant'] = null;
                }
                // tenant = criteria['tenant'];
                req.query.criteria = JSON.stringify(criteria);

            } else if (req.method === 'POST') {
                if (!req.body.criteria) {
                    req.body.criteria = {};
                }
                if (!req.body.criteria['tenant']) {
                    req.body.criteria['tenant'] = null;
                }
                // tenant = req.body.criteria['tenant'];
            }
            // req.next();
        
        // if (VW_Environment.isMultiTenantDeployment && !tenant || 
        //         !VW_Environment.isMultiTenantDeployment && tenant) {
        //     console.log(`Invalid request.`);
        //     res.send('Invalid request. Unexpected tenant details.');
        // }
            console.log('No middleware is set.')
            req.next();
        
    }

}
const setMiddlewareForProject = () => {

    app.use(bodyParser.json({ limit: '50mb' }));
    app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));
    app.use(compression());

    
    app.use(cors());

    app.use(function (req, res, next) {

        // console.log('Calling before middlewareApi...', JSON.stringify(req));
        manageApiRequestMiddleWare(req, res, next);

    });

}

const connection = mysql.createPool({
  host: process.env.host || "localhost",
  user: process.env.user || 'root',
  password: process.env.pass,
  database: process.env.db || 'contact'
});

const runQuery = ( sqlQuery, params = null, connection) => {
    return new Promise((resolve, reject) => {
        connection.query(sqlQuery, params, (err, result) => {
            if (err) {
                // reject(new ApplicationError({ errorObject: err, location: __locationObject }));
                reject(err);
                return;
            }
            resolve(result);
            return;
        })
    })
}


const getCriteria_helper = (req) => {
    let criteria;

    if (req.method == 'GET') {
        criteria = JSON.parse(req.query.criteria);
    } else if (req.method == 'POST') {
        criteria = req.body.criteria;
    }

    return criteria;
}

const sendResponse = (data,  message, code = 000000) => {
    return { errorCode: code, errorDiscription: message, data: data  }
}

const  hasDuplicate = (arr) => {
    const set = new Set(arr);
    return set.size !== arr.length;
  }


module.exports = {
    setRoute,
    use,
    setMiddlewareForProject,
    runQuery,
    connection,
    getCriteria_helper,
    sendResponse,
    hasDuplicate
}