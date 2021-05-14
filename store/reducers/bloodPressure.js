import { SET_BLOODPRESSURE, BLOODPRESSURE_UPDATE } from '../actions/bloodPressure';

const initialState = {
    bloodPressures: [],
    update: 0
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
    }
    return state;
};