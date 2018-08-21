export const calcTime = (second) => {
    if (second < 60)
    {
        return `${second} secs`;
    }
    else if (second >= 60 && second < 3600)
    {
        return `${Math.floor(second / 60)} mins`;
    }
    else if (second >= 3600 && second < 86400)
    {
        return `${Math.floor(second / 3600)} hours`;
    }
    else
    {
        return `${Math.floor(second / 86400)} days ${Math.floor(second % 86400) === 0 ? '' : `${Math.floor(Math.floor(second % 86400) / 3600)} hours`}`;
    }
};

export const cutText = (val, length = 17) => {
    return `${val.slice(0, length)}...`;
};
