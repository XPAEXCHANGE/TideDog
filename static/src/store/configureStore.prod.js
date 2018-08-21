import { createStore, applyMiddleware } from 'redux';
import { createEpicMiddleware } from 'redux-observable';
import rootReducer from '../reducers';
import rootEpic from '../epics';

const epicMiddleware = createEpicMiddleware();

export default function configureStore(middleware, initialState)
{
    const enhancer = applyMiddleware(epicMiddleware, middleware);
    const store = createStore(rootReducer, initialState, enhancer);
    epicMiddleware.run(rootEpic);
    return store;
}
