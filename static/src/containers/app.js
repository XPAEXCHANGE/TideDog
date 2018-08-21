import React from 'react';
import createHistory from 'history/createBrowserHistory';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { ConnectedRouter, routerMiddleware } from 'react-router-redux';
import { I18nextProvider } from 'react-i18next';
import styledNormalize from 'styled-normalize';
import { injectGlobal } from 'styled-components';
import configureStore from '../store/configureStore';
import createRoutes from '../routes/routes';
import i18n from '../i18n/i18n';

// react-router-redux
const history = createHistory();
const middleware = routerMiddleware(history);

// store
const store = configureStore(middleware);

// routes
const routes = createRoutes();

/* eslint no-unused-expressions: ["error", { "allowTaggedTemplates": true }] */
injectGlobal`
    ${styledNormalize}

    body {
        box-sizing: border-box;
        background-color: #f4f4f4;

        * {
            box-sizing: border-box;
            font-family: 'Roboto', sans-serif;
            font-weight: 300;
        }
    }
`;

render(
    <Provider store={store}>
        <ConnectedRouter history={history}>
            <I18nextProvider i18n={i18n}>
                {routes}
            </I18nextProvider>
        </ConnectedRouter>
    </Provider>,
    document.getElementById('root')
);
