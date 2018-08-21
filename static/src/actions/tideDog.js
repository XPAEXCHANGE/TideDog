import * as types from '../actionTypes';


// list
export const fetchList$ = () => {
    return {
        type: types.FETCH_LIST_REQ$
    };
};

export const fetchListLoading = () => {
    return {
        type: types.FETCH_LIST_LOADING
    };
};

export const fetchListSuc = (data) => {
    return {
        type: types.FETCH_LIST_SUC,
        data
    };
};

export const fetchListErr = (data) => {
    return {
        type: types.FETCH_LIST_ERR,
        data
    };
};

export const fetchListCancel$ = () => {
    return {
        type: types.FETCH_LIST_CANCEL$,
    };
};

export const emptyRecord = () => {
    return {
        type: types.EMPTY_RECORD,
    };
};


// record
export const fetchRecord$ = (txHash) => {
    return {
        type: types.FETCH_RECORD_REQ$,
        txHash
    };
};

export const fetchRecordSuc = (data) => {
    return {
        type: types.FETCH_RECORD_SUC,
        data
    };
};

export const fetchRecordErr = (data) => {
    return {
        type: types.FETCH_RECORD_ERR,
        data
    };
};

export const fetchRecordCancel$ = () => {
    return {
        type: types.FETCH_RECORD_CANCEL$,
    };
};
