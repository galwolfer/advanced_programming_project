import './HomeNavbar.css'

function HomeNavbar() {
    return (
        <div className='upper-navbar'>
            <button type="button" class="btn btn-info" id='button-categories-first'>Israel</button>
            <button type="button" class="btn btn-info" id='button-categories'>Animals</button>
            <button type="button" class="btn btn-info" id='button-categories'>Nature</button>
            <button type="button" class="btn btn-info" id='button-categories'>Gaming</button>
            <button type="button" class="btn btn-info" id='button-categories'>Computer science</button>
            <button type="button" class="btn btn-info" id='button-categories'>Food</button>
            <button type="button" class="btn btn-info" id='button-categories'>Clubbing</button>
        </div>
    )
}
export default HomeNavbar;