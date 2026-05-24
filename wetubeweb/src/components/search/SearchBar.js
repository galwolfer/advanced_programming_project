import './SearchBar.css';

function SearchBar({ isDarkMode, setSearchQuery }) {
    return (
        <>
            <input 
                type="text" 
                placeholder='Search...' 
                className='searchBar' 
                onChange={(e) => setSearchQuery?.(e.target.value)}
            />           
        </>
    );
}

export default SearchBar;
