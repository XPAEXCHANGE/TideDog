import React from 'react';
import PropTypes from 'prop-types';

class Wrapper extends React.Component
{
    constructor(props)
    {
        super(props);
        this.state = {};
    }

    render()
    {
        const { children } = this.props;
        return children;
    }
}

Wrapper.propTypes = {
    children: PropTypes.object.isRequired
};

export default Wrapper;
