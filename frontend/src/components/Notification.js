import React from 'react';
import './Notification.css'; // Assuming you will create a CSS file for styling

const Notification = ({ message }) => {
    return (
        <div className="notification">
            {message}
        </div>
    );
};

export default Notification;
