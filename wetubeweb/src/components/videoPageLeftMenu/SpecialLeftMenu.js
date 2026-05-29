import React, { useState } from "react";
import './SpecialLeftMenu.css';
import { Link } from "react-router-dom";

function VpLeftMenu({isDarkMode}) {
    const [isMenuVisible, setIsMenuVisible] = useState(false);

    const clickMenu = () => {
        setIsMenuVisible(prevState => !prevState);
    };

    return (
        <div className="left-menu-wrapper">
            <div className={`menuContainer ${isMenuVisible ? 'visible' : ''}`}>
                <div className={isDarkMode ? "left-menu-dark" : "left-menu"}>
                    <ul className="list-group">
                        <Link to='/'>
                        <li className="list-group-item d-flex justify-content-between align-items-center" id={isDarkMode ? "listRowDark" : "listRow"}>
                            Home
                            <i className="bi bi-house-door-fill"></i>
                        </li>
                        </Link>
                        <li className="list-group-item d-flex justify-content-between align-items-center" id={isDarkMode ? "listRowDark" : "listRow"}>
                            Shorts
                            <i className="bi bi-file-earmark-play"></i>
                        </li>
                        <Link to='/subscriptions'>
                        <li className="list-group-item d-flex justify-content-between align-items-center" id={isDarkMode ? "listRowDark" : "listRow"}>
                            Subscriptions
                            <i className="bi bi-people-fill"></i>
                        </li>
                        </Link>
                        <li className="list-group-item d-flex justify-content-between align-items-center" id={isDarkMode ? "listRowDark" : "listRow"}>
                            You
                            <i className="bi bi-person-video2"></i>
                        </li>
                    </ul>
                    <li className="separator"></li>
                    <div className='you-more'>You {'>'}</div>
                    <ul className="list-group" id='more-menu'>
                    <Link to='/history'>
                    <li className="list-group-item d-flex justify-content-between align-items-center" id={isDarkMode ? "listRowDark" : "listRow"}>
                        History
                        <i className="bi bi-clock-history"></i>
                    </li>
                    </Link>
                    <Link to='/playlists'>
                    <li className="list-group-item d-flex justify-content-between align-items-center" id={isDarkMode ? "listRowDark" : "listRow"}>
                        Playlists
                        <i className="bi bi-play-btn"></i>
                    </li>
                    </Link>
                    <Link to='/liked'>
                    <li className="list-group-item d-flex justify-content-between align-items-center" id={isDarkMode ? "listRowDark" : "listRow"}>
                        Liked videos
                        <i className="bi bi-hand-thumbs-up"></i>
                    </li>
                    </Link>
                    </ul>
                    <li className="separator"></li>
                    <ul className="list-group" id='subs'>
                        <div className='subscribtions'>Subscribtions {'>'}</div>
                    </ul>
                </div>
            </div>
            <button
                type="button"
                className="btn btn-outline-danger"
                id="openMenu"
                onClick={clickMenu}
            >
                Menu <i className={`bi ${isMenuVisible ? 'bi-arrow-up' : 'bi-arrow-down'}`}></i>
            </button>
        </div>
    );
}

export default VpLeftMenu;
