import { replaceBloodPressureFromSQL, fetchBloodPressureFromSQLBtwDateMilli, deleteBloodPressureFromLocal } from "../../helpers/dbBloodPressure";
import { replaceMessageFromSQL, fetchMessageFromSQLBtwDateMilli, deleteMessageFromLocal } from "../../helpers/dbMessage";

export const SET_BLOODPRESSURE = 'SET_BLOODPRESSURE';
export const BLOODPRESSURE_UPDATE = 'BLOODPRESSURE_UPDATE';
export const SET_TODATE = 'SET_TODATE';
export const SET_FROMDATE = 'SET_FROMDATE';

export const fetchBloodPressure = async (limit, offset, start_date, end_date, num_of_sample) => {


    var untilDateMilli = 0;
    var fromDateMilli = 0;

    if (start_date) {
        fromDateMilli = new Date(start_date.split("T")[0]).valueOf();
    }

    if (end_date) {
        untilDateMilli = new Date(end_date.split("T")[0]).valueOf() + 24 * 60 * 60 * 1000;
    }

    var dbResult;
    var loadedBloodPressures = [];
    try {
        dbResult = await fetchBloodPressureFromSQLBtwDateMilli(untilDateMilli, fromDateMilli, limit, offset, num_of_sample);
    } catch (e) {
        console.log('fetchBloodPressureFromSQL Error');
        console.log(e);
    }
    loadedBloodPressures = !!dbResult ? dbResult.rows.length !== 0 ? dbResult.rows._array : [] : [];
    if (num_of_sample === null) { 
        let dbMessageResult;
        let loadedMessages = [];
        try {
            dbMessageResult = await fetchMessageFromSQLBtwDateMilli(untilDateMilli, fromDateMilli, limit, offset);
        } catch (e) {
            console.log('fetchMessageFromSQLBtwDateMilli Error');
            console.log(e);
        }

        loadedMessages = !!dbMessageResult ? dbMessageResult.rows.length !== 0 ? dbMessageResult.rows._array : [] : [];
        // console.log("loadedMessage in fetchBloodPressure");
        // console.log(loadedMessages);
        loadedMessages.forEach((messageJson)=> {
            const index = loadedBloodPressures.findIndex((bloodPressureJson)=>bloodPressureJson.id === messageJson.id);
            console.log("messageJson in fetchBloodPressure");
            console.log(messageJson);
            if (index !== -1){
                loadedBloodPressures[index]["remark"] = messageJson.remark;
            }
        });
    }



    // console.log("loadedBloodPressures in action");
    // console.log(loadedBloodPressures);

    return loadedBloodPressures;

};


export const addBloodPressure = (timestamp, systolic_blood_pressure, diastolic_blood_pressure, pulse, remark, withRemark) => {

    const timestampMilli = new Date(timestamp).valueOf();

    return async (dispatch, getState) => {
        try {
            const dbResult = await replaceBloodPressureFromSQL(
                timestampMilli,
                systolic_blood_pressure,
                diastolic_blood_pressure,
                pulse
            );
            // console.log("dbResult from bloodPressure addBloodPressure Action");
            // console.log(dbResult);
        } catch (e) {
            console.log("Error while replacing BloodPressure db locally");
            console.log(e);
        }

        // if someone tries to create / update a remark on a new / existing record.
        if (!(remark === null || remark === "" || remark === undefined)){
            console.log("saving remark for record ", new Date(timestamp));
            try {
                const dbMessageResult = await replaceMessageFromSQL(
                    timestampMilli,
                    remark,
                );
                // console.log("dbMessageResult from message addBloodPressure Action");
                // console.log(dbMessageResult);
            } catch (e) {
                console.log("Error while replacing Message db locally");
                console.log(e);
            }
        }

        // if someone tries to remove a remark from an existing record.
        if (withRemark && remark === "") {
            try {
                const dbMessageDeleteResult = await deleteMessageFromLocal(
                    timestampMilli
                );
                // console.log("dbResult from message deleteMessageFromLocal Action");
                // console.log(dbMessageDeleteResult);
            } catch (e) {
                console.log("Error while deleting one message record locally");
                console.log(e);
            }
        }

        dispatch({
            type: BLOODPRESSURE_UPDATE
        });

    };
};

export const deleteBloodPressure = (timestamp, withRemark) => {

    const timestampMilli = new Date(timestamp).valueOf();

    return async (dispatch, getState) => {
        try {
            const dbResult = await deleteBloodPressureFromLocal(
                timestampMilli
            );
            console.log("dbResult from bloodPressure deleteBloodPressure Action");
            console.log(dbResult);
        } catch (e) {
            console.log("Error while deleting one BloodPressure record locally");
            console.log(e);
        }

        if (withRemark) {
            try {
                const dbMessageResult = await deleteMessageFromLocal(
                    timestampMilli
                );
                console.log("dbResult from message deleteMessageFromLocal Action");
                console.log(dbMessageResult);
            } catch (e) {
                console.log("Error while deleting one message record locally");
                console.log(e);
            }
        }

        dispatch({
            type: BLOODPRESSURE_UPDATE
        });

    };
};

export const setFromdate = (dateISOString) => {
    return async (dispatch, getState) => {
        dispatch({
            type: SET_FROMDATE,
            fromdate: dateISOString
        });
    }
}

export const setTodate = (dateISOString) => {
    return async (dispatch, getState) => {
        dispatch({
            type: SET_TODATE,
            todate: dateISOString
        });
    }
}