import { createStore, applyMiddleware, compose } from 'redux';
import { createEpicMiddleware } from 'redux-observable';
import rootReducer from '../reducers';
import rootEpic from '../epics';

const epicMiddleware = createEpicMiddleware();

export default function configureStore(middleware, initialState)
{
    const store = createStore(
        rootReducer,
        initialState,
        compose(
            applyMiddleware(epicMiddleware, middleware),
            window.devToolsExtension ? window.devToolsExtension() : f => f
        )
    );

    epicMiddleware.run(rootEpic);

    if (module.hot)
    {
        // Enable Webpack hot module replacement for reducers
        module.hot.accept('../reducers', () => {
            store.replaceReducer(require('../reducers').default);
        });
    }

    return store;
}
