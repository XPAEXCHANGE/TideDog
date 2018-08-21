import { of, from } from 'rxjs';
import {
    switchMap, catchError, map, takeUntil
} from 'rxjs/operators';
import { ofType } from 'redux-observable';
import { get, post } from 'superagent';
import {
    fetchListSuc, fetchListErr, fetchRecordSuc, fetchRecordErr
} from '../actions/tideDog';
import * as types from '../actionTypes';

const fetchListEpic = (action$) => {
    return action$
        .pipe(
            ofType(types.FETCH_LIST_REQ$),
            switchMap(() => {
                return from(get('/api/subscribe/listall')).pipe(
                    takeUntil(action$.ofType(types.FETCH_LIST_CANCEL$)),
                );
            }),
            map((res) => {
                const resObj = res.body;
                if (resObj.status)
                {
                    return fetchListSuc(
                        resObj.results
                    );
                }
                else
                {
                    return fetchListErr(
                        resObj.errcode
                    );
                }
            }),
            catchError((err) => {
                return of(
                    fetchListErr(
                        err.response
                    )
                );
            })
        );
};

const fetchRecordEpic = (action$) => {
    return action$
        .pipe(
            ofType(types.FETCH_RECORD_REQ$),
            switchMap((action) => {
                return from(post('/api/subscribe/tx_info')
                    .set('Content-Type', 'application/json')
                    .send({ txhash: action.txHash })).pipe(
                    takeUntil(action$.ofType(types.FETCH_RECORD_CANCEL$)),
                );
            }),
            map((res) => {
                const { status, results } = res.body;

                if (status)
                {
                    return fetchRecordSuc(
                        results[0]
                    );
                }
                else
                {
                    return fetchRecordErr(
                        res
                    );
                }
            }),
            catchError((err) => {
                return of(
                    fetchRecordErr(
                        err.response
                    )
                );
            })
        );
};

export default [
    fetchListEpic,
    fetchRecordEpic
];
