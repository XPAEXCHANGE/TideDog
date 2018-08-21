import update from 'immutability-helper';
import * as types from '../actionTypes';

const initialState = {
    lists: {
        counts: 0,
        data: [],
        totalPages: 1,
        isLoading: false
    },
    record: {}
};

export default function counter(state = initialState, action = {})
{
    switch (action.type)
    {
        case types.FETCH_LIST_SUC:
            const { data } = action;
            // 設定一頁15筆
            const totalPages = Math.ceil(data.length / 15);

            return update(state, {
                lists: {
                    counts: { $set: data.length },
                    data: { $set: data },
                    totalPages: { $set: totalPages === 0 ? 1 : totalPages },
                    isLoading: { $set: false },
                },
            });

        case types.FETCH_LIST_LOADING:
            return update(state, {
                lists: {
                    isLoading: { $set: true },
                },
            });

        case types.FETCH_RECORD_SUC:
            return update(state, {
                record: { $set: action.data }
            });

        case types.EMPTY_RECORD:
            return update(state, {
                record: { $set: {} }
            });

        default:
            return state;
    }
}
