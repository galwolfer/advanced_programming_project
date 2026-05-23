import './leftMenu.css';
import { useState } from 'react';
import { Link } from 'react-router-dom';

function LeftMenu({isDarkMode}) {
    const [isMenuVisible, setIsMenuVisible] = useState(false);

    const clickMenu = () => {
        setIsMenuVisible(prevState => !prevState);
    }

    return (
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
                <li className="list-group-item d-flex justify-content-between align-items-center" id={isDarkMode ? "listRowDark" : "listRow"}>
                    Subscribtions
                    <i className="bi bi-people-fill"></i>
                </li>
                <li className="list-group-item d-flex justify-content-between align-items-center" id={isDarkMode ? "listRowDark" : "listRow"}>
                    You
                    <i className="bi bi-person-video2"></i>
                </li>
            </ul>

            <div className={`menuContainer ${isMenuVisible ? 'visible' : ''}`}>
                <li className="separator"></li>
                <div className='you-more'>You {'>'}</div>
                <ul className="list-group" id='more-menu'>
                    <li className="list-group-item d-flex justify-content-between align-items-center" id={isDarkMode ? "listRowDark" : "listRow"}>
                        Your channel
                        <i className="bi bi-person-video"></i>
                    </li>
                    <li className="list-group-item d-flex justify-content-between align-items-center" id={isDarkMode ? "listRowDark" : "listRow"}>
                        History
                        <i className="bi bi-clock-history"></i>
                    </li>
                    <li className="list-group-item d-flex justify-content-between align-items-center" id={isDarkMode ? "listRowDark" : "listRow"}>
                        Playlists
                        <i className="bi bi-play-btn"></i>
                    </li>
                    <li className="list-group-item d-flex justify-content-between align-items-center" id={isDarkMode ? "listRowDark" : "listRow"}>
                        Your videos
                        <i className="bi bi-camera-reels"></i>
                    </li>
                    <li className="list-group-item d-flex justify-content-between align-items-center" id={isDarkMode ? "listRowDark" : "listRow"}>
                        Liked videos
                        <i className="bi bi-hand-thumbs-up"></i>
                    </li>
                </ul>
                <li className="separator"></li>
                <ul className="list-group" id='subs'>
                    <div className='subscribtions'>Subscribtions {'>'}</div>
                </ul>
            </div>

            <button
                type="button"
                className="btn btn-outline-danger"
                id="openMenu"
                onClick={clickMenu}
            >
                More <i className={`bi ${isMenuVisible ? 'bi-arrow-up' : 'bi-arrow-down'}`}></i>
            </button>
        </div>
    )
}

export default LeftMenu;
