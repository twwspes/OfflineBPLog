import { SET_BLOODPRESSURE, BLOODPRESSURE_UPDATE, SET_TODATE, SET_FROMDATE } from '../actions/bloodPressure';

const initialState = {
    bloodPressures: [],
    update: 0,
    todate: '', // ISOString or empty string
    fromdate: '', // ISOString or empty string
};

export default (state = initialState, action) => {
    switch (action.type) {
        case SET_BLOODPRESSURE:
            return {
                ...state,
                bloodPressures: action.bloodPressures.reverse(),
            }
        case BLOODPRESSURE_UPDATE:
            return {
                ...state,
                update: state.update + 1
            }
        case SET_TODATE:
            console.log(action.todate);
            return {
                ...state,
                todate: action.todate
            }
        case SET_FROMDATE:
            return {
                ...state,
                fromdate: action.fromdate
            }
    }
    return state;
};