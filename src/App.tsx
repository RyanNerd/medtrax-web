import LandingPage from "./components/Landing/LandingPage";
import React, {useGlobal} from 'reactn';
import {FULLNAME} from "./utility/common";

/**
 * Main Entry Component
 *
 * @returns {*}
 * @constructor
 */
function App()
{
    // @ts-ignore TS2345: Argument of type '"activeResident"' is not assignable to parameter of type 'never'.
    const [ activeResident ] = useGlobal('activeResident');

    return (
        <>
            {activeResident ? <h2 style={{textAlign: "center"}}><span style={{background:"#edf11e"}}>{FULLNAME(activeResident)}</span></h2> : null}
            <LandingPage/>
        </>
    );
}

export default App;
