import React, {useGlobal, useState} from 'reactn';
import Tabs from 'react-bootstrap/Tabs';
import Tab from 'react-bootstrap/Tab';
import LoginPage from './../Login/LoginPage';
import ScanPage from "../Scan/ScanPage";
import ResidentPage from "../Resident/ResidentPage";

function LandingPage() {
    const [key, setKey] = useState('login');
    const [ apiKey ] = useGlobal('apiKey');

    return (
        <Tabs
            id="controlled-tab-example"
            activeKey={key}
            onSelect={key => setKey(key)}
        >
            <Tab
                sytle={{marginLeft: "15px"}}
                eventKey="login"
                title={apiKey ? "Logout" : "Login"}
            >
                <LoginPage onLogin={(loggedIn) => {setKey(loggedIn ? 'scan' : 'login')}} />
            </Tab>
            <Tab
                disabled={apiKey === null}
                eventKey="scan"
                title="Lookup"
            >
                <ScanPage/>
            </Tab>
            <Tab
                disabled={apiKey === null}
                eventKey="resident"
                title="Resident">
                <ResidentPage />
            </Tab>
            <Tab
                disabled={apiKey === null}
                eventKey="history"
                title="Medical History">
                <p>Place Holder for Medical History</p>
            </Tab>
        </Tabs>
    );
}

export default LandingPage;