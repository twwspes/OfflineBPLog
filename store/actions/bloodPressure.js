import { replaceBloodPressureFromSQL, fetchBloodPressureFromSQLBtwDateMilli, deleteBloodPressureFromLocal, deleteBloodPressuresFromLocal } from "../../helpers/dbBloodPressure";
import { replaceMessageFromSQL, fetchMessageFromSQLBtwDateMilli, deleteMessageFromLocal, deleteMessagesFromLocal } from "../../helpers/dbMessage";

export const SET_BLOODPRESSURE = 'SET_BLOODPRESSURE';
export const BLOODPRESSURE_UPDATE = 'BLOODPRESSURE_UPDATE';
export const SET_TODATE = 'SET_TODATE';
export const SET_FROMDATE = 'SET_FROMDATE';

export const fetchBloodPressure = async (limit, offset, start_date, end_date, num_of_sample) => {


    var untilDateMilli = 0;
    var fromDateMilli = 0;

    if (start_date) {
        fromDateMilli = new Date(start_date).valueOf();
    }

    if (end_date) {
        untilDateMilli = new Date(end_date).valueOf();
    }

    var rows;
    var loadedBloodPressures = [];
    try {
        rows = await fetchBloodPressureFromSQLBtwDateMilli(untilDateMilli, fromDateMilli, limit, offset, num_of_sample);
    } catch (e) {
        console.log('fetchBloodPressureFromSQL Error');
        console.log(e);
    }
    loadedBloodPressures = !!rows ? rows.length !== 0 ? rows : [] : [];
    if (num_of_sample === null) {
        let rows;
        let loadedMessages = [];
        try {
            rows = await fetchMessageFromSQLBtwDateMilli(untilDateMilli, fromDateMilli, limit, offset);
        } catch (e) {
            console.log('fetchMessageFromSQLBtwDateMilli Error');
            console.log(e);
        }

        loadedMessages = !!rows ? rows.length !== 0 ? rows : [] : [];
        console.log("loadedMessage in fetchBloodPressure");
        console.log(loadedMessages);
        loadedMessages.forEach((messageJson) => {
            const index = loadedBloodPressures.findIndex((bloodPressureJson) => bloodPressureJson.id === messageJson.id);
            // console.log("messageJson in fetchBloodPressure");
            // console.log(messageJson);
            if (index !== -1) {
                loadedBloodPressures[index]["remark"] = messageJson.remark;
            }
        });
    }



    console.log("loadedBloodPressures in action");
    // console.log(loadedBloodPressures);

    return loadedBloodPressures;

};


export const addBloodPressure = (timestamp, systolic_blood_pressure, diastolic_blood_pressure, pulse, remark, withRemark, shouldStopInstantUpdate) => {

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
        if (!(remark === null || remark === "" || remark === undefined)) {
            // console.log("saving remark for record ", new Date(timestamp));
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

        if (shouldStopInstantUpdate === undefined) {
            console.log('update state');
            dispatch({
                type: BLOODPRESSURE_UPDATE
            });
        } else if (shouldStopInstantUpdate !== undefined && shouldStopInstantUpdate) {
            console.log('update state');
            dispatch({
                type: BLOODPRESSURE_UPDATE
            });
        }

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

export const forceUpdateBPState = () => {
    return async (dispatch, getState) => {
        dispatch({
            type: BLOODPRESSURE_UPDATE,
        });
    }
}

export const deleteAllBloodPressures = () => {
    return async (dispatch, getState) => {
        try {
            const dbBloodPressureResult = await deleteBloodPressuresFromLocal();
            // console.log("dbMessageResult from message addBloodPressure Action");
            // console.log(dbMessageResult);
        } catch (e) {
            console.log("Error while deleting All Blood Pressures db locally");
            console.log(e);
        }
        try {
            const dbMessageResult = await deleteMessagesFromLocal();
            // console.log("dbMessageResult from message addBloodPressure Action");
            // console.log(dbMessageResult);
        } catch (e) {
            console.log("Error while deleting All Blood Pressures db locally");
            console.log(e);
        }
        dispatch({
            type: BLOODPRESSURE_UPDATE,
        });
    }
}

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