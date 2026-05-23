// header.js
import React from 'react';

function Header({ signedInUser }) {
  return (
    <header>
      {signedInUser ? (
        <div>Welcome, {signedInUser.displayName}</div>
      ) : (
        <div>Please sign in</div>
      )}
    </header>
  );
}

export default Header;
