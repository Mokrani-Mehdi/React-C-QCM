import React from 'react'
import logo from '/askware_logo_bleu.svg';

const PRIMARY_COLOR = '#00538B';
export default function NavBar() {
  return (
   
    <div className='NavBar'>
    <nav style={{ backgroundColor: PRIMARY_COLOR }} className="p-5">
      <div className="container mx-auto flex items-center justify-between">
        <img src={logo} alt="Company Logo" className="h-12" />
        <h1 className="text-white text-xl font-bold">C# Assessment Quiz</h1>
      </div>
    </nav>
    </div>
  )
}
