import React, {useGlobal, useState} from 'reactn';
import Tabs from 'react-bootstrap/Tabs';
import Tab from 'react-bootstrap/Tab';
import LoginPage from './../Login/LoginPage';
import ResidentPage from "../Resident/ResidentPage";
import MedicinePage from "../Medicine/MedicinePage";
import DrugHistoryPage from "../DrugHistory/DrugHistoryPage";
import ManageDrugPage from "../ManageDrugs/ManageDrugPage";
import OtcPage from "../Otc/OtcPage";

const LandingPage = () => {
    const [ apiKey, setApiKey ] = useGlobal('apiKey');
    const [ activeResident ] = useGlobal('activeResident');
    const [ development ] = useGlobal('development');

    const [ errorDetails, setErrorDetails ] = useState(null);
    const [ activeTabKey, setActiveTabKey ] = useState('login');

    const [ drugLogList ] = useGlobal('drugLogList');
    const [ medicineList ] = useGlobal('medicineList');
    const [ otcList ] = useGlobal('otcList');

    function errorOccurred(err)
    {
        if (development) {
            console.error('Error', err);
            if (err) {
                setErrorDetails(err.toString());
            } else {
                setErrorDetails('Unknown Error');
            }
        } else {
            setErrorDetails('Something went wrong. Please check your internet connection and sign back in.');
        }
        setApiKey(null);
        setActiveTabKey('error');
    }

    return (
        <Tabs
            id="landing-page-tabs"
            activeKey={activeTabKey}
            onSelect={(key) => setActiveTabKey(key)}
        >
            <Tab
                sytle={{marginLeft: "15px"}}
                eventKey="login"
                title={apiKey ? "Logout" : "Login"}
            >
                <LoginPage
                    onLogin={(loggedIn) => {setActiveTabKey(loggedIn ? 'resident' : 'login')}}
                    onError={(error) => errorOccurred(error)}
                />
            </Tab>
            <Tab
                disabled={apiKey === null || !activeResident}
                eventKey="log"
                title="Rx">
                <MedicinePage
                    onError={(error) => errorOccurred(error)}
                />
            </Tab>
            <Tab
                disabled={apiKey === null || !activeResident}
                eventKey="otc"
                title="OTC">
                <OtcPage/>
            </Tab>
            <Tab
                disabled={apiKey === null}
                eventKey="resident"
                title="Resident List">
                <ResidentPage
                    onError={(error) => errorOccurred(error)}
                />
            </Tab>
            <Tab
                disabled={apiKey === null || !activeResident}
                eventKey="history"
                title="Drug History"
            >
                <DrugHistoryPage
                    drugLogList={drugLogList}
                    medicineList={medicineList}
                    otcList={otcList}
                />
            </Tab>
            <Tab
                disabled={apiKey === null || !activeResident}
                eventKey="manage"
                title="Manage Medicine"
            >
                <ManageDrugPage
                    onError={(error) => errorOccurred(error)}
                />
            </Tab>
            <Tab
                disabled={activeTabKey !== 'error'}
                eventKey="error"
                title="Diagnostics"
            >
                <p>{errorDetails}</p>
            </Tab>
        </Tabs>
    );
}

export default LandingPage;
