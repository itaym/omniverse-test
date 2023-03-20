import React, { HTMLAttributes ,ReactNode } from 'react'
import Style from './Header.module.scss'

interface IHeaderProps extends HTMLAttributes<HTMLElement> {
    children?: ReactNode;
}

const Header = (props:IHeaderProps) => (
    <nav className={Style.header}>
        <ul className={Style.MenuNavbar}>
            <div className={Style.MenuLogoPlace}>
                <li><a>OMNIVERSE</a></li>
            </div>
            <div className={Style.MenuListPlace}>
                Made by Itay Merchav
            </div>
        </ul>
    </nav>)

export default Header