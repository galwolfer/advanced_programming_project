import './HomeNavbar.css'

function HomeNavbar({ categories, selectedCategory, setSelectedCategory, sortBy, setSortBy }) {
    return (
        <div className='upper-navbar'>
            {categories.map((category, index) => (
                <button
                    key={category}
                    type="button"
                    className="btn btn-info"
                    id={index === 0 ? 'button-categories-first' : 'button-categories'}
                    onClick={() => setSelectedCategory(category)}
                    style={{ opacity: selectedCategory === category ? 1 : 0.7 }}
                >
                    {category}
                </button>
            ))}
            <select className='form-select sort-selector ms-3' value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option value='latest'>Latest</option>
                <option value='popular'>Most Viewed</option>
                <option value='liked'>Most Liked</option>
            </select>
        </div>
    )
}
export default HomeNavbar;