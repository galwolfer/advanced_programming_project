import './UpperLayout.css';
import SearchBar from '../search/SearchBar';
import 'bootstrap/dist/js/bootstrap.bundle.min';
import { Tooltip } from 'bootstrap';
import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function UpperLayout({ user, setUser, isDarkMode, setSearchQuery }) {
    const navigate = useNavigate();

    useEffect(() => {
        const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
        const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new Tooltip(tooltipTriggerEl));

        return () => {
            tooltipList.forEach(tooltip => tooltip.dispose());
        };
    }, [user]);

    const uploadIfSigned = () => {
        if (!user) {
            alert('You need to be signed in to upload!');
            return;
        }
        navigate('/upload');
    };

    const signOutFunc = () => {
        setUser(null);
        navigate('/');
    };

    return (
        <div className='upperSection'>
            <SearchBar isDarkMode={isDarkMode} setSearchQuery={setSearchQuery} />
            <div className='buttons'>
                <button type="button" className="btn text-nowrap" id={isDarkMode ? "addBtnDark" : "addBtn"} data-bs-toggle="tooltip" data-bs-placement="top"
                    data-bs-custom-class="custom-tooltip"
                    data-bs-title="Add video" onClick={uploadIfSigned}>
                    <i className="bi bi-plus-circle"></i>
                </button>
                <button type="button" className="btn text-nowrap" id={isDarkMode ? "notifBtnDark" : "notifBtn"} data-bs-toggle="tooltip" data-bs-placement="top"
                    data-bs-custom-class="custom-tooltip" data-bs-title="Notifications">
                    <i className="bi bi-bell"></i>
                </button>
                <div className="profile-info">
                    {user ? (
                        <div className='ifSignedIn'>
                            <button type="button" className="btn text-nowrap profile-btn" id={isDarkMode ? "profileBtnDark" : "profileBtn"} data-bs-toggle="tooltip" data-bs-placement="top"
                                data-bs-custom-class="custom-tooltip" data-bs-title="Your profile">
                                {user.profilePicture ? (
                                    <img src={URL.createObjectURL(user.profilePicture)} className="profile-picture" alt="Profile" />
                                ) : (
                                    <i className="bi bi-person-circle"></i>
                                )}
                                <div className='btnTxt'>
                                    signed in as: {user.username}
                                </div>
                            </button>
                            <button type="button" className="btn text-nowrap" id="signOutBtn" data-bs-toggle="tooltip" data-bs-placement="top"
                                data-bs-custom-class="custom-tooltip"
                                data-bs-title="Sign out" onClick={signOutFunc}>
                                <i className="bi bi-box-arrow-left" id='signOutIcon'></i>
                            </button>
                        </div>
                    ) : (
                        <Link to='/signin' className="btn text-nowrap profile-btn" id={isDarkMode ? "profileBtnDark" : "profileBtn"} data-bs-toggle="tooltip" data-bs-placement="top"
                            data-bs-custom-class="custom-tooltip" data-bs-title="Sign in">
                            <i className="bi bi-person-circle" id='btnContainer'></i>
                            <div className='btnTxt'>
                                Sign in
                            </div>
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );
}

export default UpperLayout;
