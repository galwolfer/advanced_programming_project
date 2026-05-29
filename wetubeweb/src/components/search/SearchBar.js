import './SearchBar.css';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function SearchBar({ isDarkMode, setSearchQuery }) {
    const [query, setQuery] = useState('');
    const navigate = useNavigate();

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            if (setSearchQuery) {
                setSearchQuery(query);
            }
            if (query.trim()) {
                navigate(`/search?q=${encodeURIComponent(query)}`);
            }
        }
    };

    return (
        <>
            <input 
                type="text" 
                placeholder='Search...' 
                className='searchBar' 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
            />           
        </>
    );
}

export default SearchBar;
