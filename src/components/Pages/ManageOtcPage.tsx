import Confirm from "../Modals/Confirm";
import MedicineDetail from "../Grids/MedicineDetail";
import MedicineEdit from "../Modals/MedicineEdit";
import React, {useGlobal, useState} from 'reactn';
import Table from "react-bootstrap/Table";
import TooltipButton from "../Buttons/TooltipButton";
import {Alert} from "react-bootstrap";
import {MedicineRecord, newDrugInfo} from "../../types/RecordTypes";

/**
 * ManageOtcPage
 * Page for Displaying, editing and adding OTC drugs
 * @returns {JSX.Element}
 */
const ManageOtcPage = (): JSX.Element | null => {
    const [, setDeleteOtcMedicine] = useGlobal('deleteOtcMedicine');
    const [, setUpdateOtcMedicine] = useGlobal('updateOtcMedicine');
    const [activeTabKey] = useGlobal('activeTabKey');
    const [medicineInfo, setMedicineInfo] = useState<MedicineRecord | null>(null);
    const [otcList] = useGlobal('otcList');
    const [showDeleteMedicine, setShowDeleteMedicine] = useState(false);
    const [showMedicineEdit, setShowMedicineEdit] = useState(false);

    // If this tab isn't active then don't render
    if (activeTabKey !== 'manage-otc') {
        return null;
    } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    /**
     * Fires when the Edit button is clicked
     * @param {MouseEvent} e
     * @param {MedicineRecord | null} medicine
     */
    const onEdit = (e: React.MouseEvent<HTMLElement>, medicine?: MedicineRecord | null) => {
        e.preventDefault();
        const medicineInfo = (medicine) ? {...medicine} : {...newDrugInfo, OTC: true};
        setMedicineInfo(medicineInfo);
        setShowMedicineEdit(true);
        setMedicineInfo(medicineInfo);
        setShowMedicineEdit(true);
    }

    /**
     * Handle the click event for delete
     * @param {React.MouseEvent<HTMLElement>} e
     * @param {MedicineRecord} medicine
     */
    const onDelete = (e: React.MouseEvent<HTMLElement>, medicine: MedicineRecord) => {
        e.preventDefault();
        setMedicineInfo({...medicine});
        setShowDeleteMedicine(true);
    }

    return (
        <>
            <TooltipButton
                className="mb-2"
                tooltip="Manually Add New OTC"
                size="sm"
                variant="info"
                onClick={(e: React.MouseEvent<HTMLElement>) => onEdit(e, null)}
            >
                + OTC
            </TooltipButton>

            <Table
                striped
                bordered
                hover
                size="sm"
            >
                <thead>
                <tr>
                    <th> </th>
                    <th>
                        Drug
                    </th>
                    <th>
                        Strength
                    </th>
                    <th>
                        Directions
                    </th>
                    <th>
                        Barcode
                    </th>
                    <th> </th>
                </tr>
                </thead>
                <tbody>
                {otcList.map((drug: MedicineRecord) =>
                    <MedicineDetail
                        drug={drug}
                        columns={[
                            'Drug',
                            'Strength',
                            'Directions',
                            'Barcode'
                        ]}
                        key={'otc' + drug.Id}
                        onDelete={onDelete}
                        onEdit={onEdit}
                    />)
                }
                </tbody>
            </Table>

            {showMedicineEdit && medicineInfo &&
                /* MedicineEdit Modal */
                <MedicineEdit
                    otc={true}
                    show={showMedicineEdit}
                    onClose={(r) => {
                        setShowMedicineEdit(false);
                        setUpdateOtcMedicine(r || null);
                    }}
                    drugInfo={medicineInfo}
                />
            }

            {medicineInfo && showDeleteMedicine &&
                <Confirm.Modal
                    size="lg"
                    show={showDeleteMedicine}
                    buttonvariant="danger"
                    onSelect={(a) => {
                        setShowDeleteMedicine(false);
                        setDeleteOtcMedicine(a ? medicineInfo?.Id : null);
                    }}
                >
                    <Confirm.Header>
                        <Confirm.Title>
                            {"Delete " + medicineInfo.Drug}
                        </Confirm.Title>
                    </Confirm.Header>
                    <Confirm.Body>
                        <Alert
                            variant="danger"
                            style={{textAlign: "center"}}
                        >
                            <span>
                                This will delete the OTC medicine <b>{medicineInfo.Drug}</b> for <i>ALL</i> residents
                            </span>
                            <span> and <b>ALL</b> history for this drug!</span>
                        </Alert>
                        <Alert variant="warning">
                            Are you sure?
                        </Alert>
                    </Confirm.Body>
                </Confirm.Modal>
            }
        </>
    );
}

export default ManageOtcPage;
