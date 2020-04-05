import React from 'react';
import AppBar from '@material-ui/core/AppBar';
import ToolBar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import SoftPhone from './SoftPhone';

const NavBar = ()=>{
    return(
        <div>
            <AppBar position="static">
                <ToolBar>
                    <Typography variant="title" color="inherit" >
                        Mediasoup Client
                    </Typography>
                </ToolBar>
            </AppBar>
            <SoftPhone/>
        </div>
    )
}

export default NavBar;