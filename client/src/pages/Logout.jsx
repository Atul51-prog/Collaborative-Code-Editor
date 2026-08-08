import React, { useEffect } from 'react'
import { useHistory } from 'react-router';
import { useAuth } from '../auth';

const Logout = () => {


    const history = useHistory();
    const { logout } = useAuth();

    useEffect(()=>{
        logout().then(() => {
            history.push('/');
        }).catch((err)=>{
            console.log(err)
        })
    }, [history, logout]);

    return (
        <div>
            <h1>
                Logout
            </h1>
        </div>
    )
}

export default Logout
