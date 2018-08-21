import { combineReducers } from 'redux';
import { routerReducer } from 'react-router-redux';
import tideDog from './tideDog';

const rootReducer = combineReducers({
    tideDog,
    router: routerReducer
});

export default rootReducer;
