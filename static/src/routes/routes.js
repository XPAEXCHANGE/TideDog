import React from 'react';
import { Switch, Route } from 'react-router-dom';
import Wrapper from '../components/wrapper/wrapper';
import asyncComponent from '../utils/asyncComponent';

export default function createRoutes()
{
    return (
        <Wrapper>
            <Switch>
                <Route exact path="/" component={asyncComponent(() => import('../containers/index/index').then(module => module.default))} />
                <Route exact path="/tidedog" component={asyncComponent(() => import('../containers/index/index').then(module => module.default))} />
                <Route exact path="/record/:txHash" component={asyncComponent(() => import('../containers/record/record').then(module => module.default))} />
            </Switch>
        </Wrapper>
    );
}
