import MedDrugLogHistory from 'components/Pages/Grids/MedDrugLogHistory';
import CheckoutListGroup from 'components/Pages/ListGroups/CheckoutListGroup';
import {IDropdownItem} from 'components/Pages/ListGroups/MedDropdown';
import DeleteDrugLogModal from 'components/Pages/Modals/DeleteDrugLogModal';
import DeleteMedicineModal from 'components/Pages/Modals/DeleteMedicineModal';
import DrugLogToast from 'components/Pages/Toasts/DrugLogToast';
import Badge from 'react-bootstrap/Badge';
import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import ListGroup from 'react-bootstrap/ListGroup';
import Row from 'react-bootstrap/Row';
import ToggleButton from 'react-bootstrap/ToggleButton';
import React, {useEffect, useGlobal, useState} from 'reactn';
import {DrugLogRecord, MedicineRecord, newDrugLogRecord, PillboxItemRecord, PillboxRecord} from 'types/RecordTypes';
import {
    calculateLastTaken,
    clientFullName,
    getCheckoutList,
    getDrugName,
    getMedicineRecord,
    isToday,
    multiSort,
    SortDirection
} from 'utility/common';
import TabContent from '../../styles/common.css';
import LastTakenButton from './Buttons/LastTakenButton';
import DrugLogGrid from './Grids/DrugLogGrid';
import PillboxCard from './Grids/PillboxCard';
import MedListGroup from './ListGroups/MedListGroup';
import OtcListGroup from './ListGroups/OtcListGroup';
import PillboxListGroup from './ListGroups/PillboxListGroup';
import DrugLogEdit from './Modals/DrugLogEdit';
import MedicineEdit from './Modals/MedicineEdit';

export type TPillboxMedLog = {
    Active: boolean;
    Drug: string | undefined;
    Notes: string | null;
    PillboxId?: number | null;
    PillboxItemId?: number | null;
    Quantity: number;
    Strength: string | null | undefined;
    Updated: Date | null | undefined;
};

// Display states
enum DISPLAY_TYPE {
    History = 'history',
    Medicine = 'med',
    OTC = 'otc',
    Pillbox = 'pillbox',
    Print = 'print'
}

interface IProps {
    activeTabKey: string;
}

/**
 * MedicinePage - UI for logging prescription medications
 * @param {IProps} props The props for this component
 * @returns {JSX.Element | null}
 */
const MedicinePage = (props: IProps): JSX.Element | null => {
    const [activeClient, setActiveClient] = useGlobal('activeClient');
    const [activeMed, setActiveMed] = useState<MedicineRecord | null>(null);
    const [activeOtc, setActiveOtc] = useState<MedicineRecord | null>(null);
    const [activePillbox, setActivePillbox] = useState<PillboxRecord | null>(null);
    const [activeTabKey, setActiveTabKey] = useState(props.activeTabKey);
    const [checkoutList, setCheckoutList] = useState<DrugLogRecord[]>([]);
    const [clientId, setClientId] = useState<number | null>(activeClient?.clientInfo?.Id || null);
    const [displayType, setDisplayType] = useState<DISPLAY_TYPE>(DISPLAY_TYPE.Medicine);
    const [isBusy, setIsBusy] = useState(false);
    const [lastTaken, setLastTaken] = useState(
        activeMed?.Id && activeClient?.drugLogList ? calculateLastTaken(activeMed.Id, activeClient.drugLogList) : null
    );
    const [medItemList, setMedItemList] = useState<IDropdownItem[]>([]);
    const [mm] = useGlobal('medicineManager');
    const [otcList, setOtcList] = useGlobal('otcList');
    const [otcLogList, setOtcLogList] = useState<DrugLogRecord[]>([]);
    const [pillboxMedLogList, setPillboxMedLogList] = useState<TPillboxMedLog[]>([]);
    const [showDeleteDrugLogRecord, setShowDeleteDrugLogRecord] = useState<DrugLogRecord | null>(null);
    const [showDeleteMedicine, setShowDeleteMedicine] = useState(0);
    const [showDrugLog, setShowDrugLog] = useState<DrugLogRecord | null>(null);
    const [showMedicineEdit, setShowMedicineEdit] = useState<MedicineRecord | null>(null);
    const [toast, setToast] = useState<null | DrugLogRecord[]>(null);

    // Refresh activeClient when the activeResident global changes.
    useEffect(() => {
        if (activeClient) {
            setClientId(activeClient?.clientInfo?.Id ? activeClient.clientInfo.Id : null);
        }
    }, [activeClient]);

    // activeTabKey refresh from prop
    useEffect(() => {
        setActiveTabKey(props.activeTabKey);
    }, [props.activeTabKey]);

    // Update the otcLogList when the drugLogList is changed.
    useEffect(() => {
        // We only want to list the OTC drugs on this page that the resident has taken.
        // @link https://stackoverflow.com/questions/31005396/filter-array-of-objects-with-another-array-of-objects
        const drugLogList = activeClient?.drugLogList;
        if (drugLogList) {
            setOtcLogList(
                drugLogList.filter((drug: DrugLogRecord) => {
                    return otcList.some((m) => {
                        return m.Id === drug?.MedicineId;
                    });
                })
            );
        }
    }, [activeClient, activeClient?.drugLogList, otcList]);

    // Update the checkoutList when drugLogList changes
    useEffect(() => {
        if (activeClient?.drugLogList) {
            setCheckoutList(getCheckoutList(activeClient.drugLogList));
        }
    }, [activeClient, setCheckoutList]);

    // Refresh the pillboxDrugLog[]
    useEffect(() => {
        if (activePillbox && activeClient) {
            const pillboxMedLog = [] as TPillboxMedLog[];
            const pillboxItemList = activeClient.pillboxItemList;
            const drugLogList = activeClient.drugLogList;
            pillboxItemList.forEach((pbi) => {
                if (pbi.PillboxId === activePillbox.Id && pbi.Quantity) {
                    const drugLogRecord = drugLogList.find(
                        (dlr) =>
                            dlr.PillboxItemId === pbi.Id &&
                            dlr.MedicineId === pbi.MedicineId &&
                            dlr.Updated &&
                            isToday(dlr.Updated)
                    );

                    if (drugLogRecord) {
                        const med = activeClient.medicineList.find((m) => m.Id === drugLogRecord.MedicineId);
                        pillboxMedLog.push({
                            Active: !!med?.Active,
                            Drug: med?.Drug,
                            Strength: med?.Strength,
                            Quantity: pbi.Quantity,
                            Notes: drugLogRecord.Notes,
                            PillboxItemId: drugLogRecord.PillboxItemId,
                            PillboxId: activePillbox.Id,
                            Updated: drugLogRecord.Updated
                        });
                    }
                }
            });
            setPillboxMedLogList(multiSort(pillboxMedLog, {Quantity: SortDirection.asc, Drug: SortDirection.desc}));
        }
    }, [activeClient, activePillbox, setPillboxMedLogList]);

    // Build the dropdown items for the Medicine dropdown
    useEffect(() => {
        const itemList = [] as IDropdownItem[];
        if (activeClient) {
            const {drugLogList, pillboxList, pillboxItemList, medicineList} = activeClient;
            const checkoutList = getCheckoutList(drugLogList);

            // Build the itemList with any pillboxes and meds from medicineList
            let pbCnt = 0;
            pillboxList.forEach((p) => {
                const pbItems = pillboxItemList.filter((pbi) => pbi.PillboxId === p.Id);
                const loggedPillboxItems = drugLogList.filter(
                    (d) => d.Updated && isToday(d.Updated) && pbItems.find((pbi) => pbi.Id === d.PillboxItemId)
                );
                if (loggedPillboxItems.length === 0) {
                    itemList.push({
                        id: -(p.Id as number),
                        description: p.Name.toUpperCase(),
                        subtext: null
                    }); // Pillbox have negative id
                    pbCnt++;
                }
            });
            if (pbCnt > 0) itemList.push({id: 0, description: 'divider', subtext: null});

            medicineList.forEach((m) => {
                if (m.Active) {
                    const strength = m.Strength || '';
                    const other = m.OtherNames?.length > 0 ? `(${m.OtherNames})` : null;
                    const checkoutMed = checkoutList.find((c) => c.MedicineId === m.Id);
                    const description = (checkoutMed ? '❎ ' : '') + m.Drug + ' ' + strength;
                    itemList.push({
                        id: m.Id as number,
                        description,
                        subtext: other
                    });
                }
            });

            // If activeMed is null, and we have med items in the list then set the initial activeMed to the first item
            if (activeMed === null && itemList.length > 0) {
                const medsOnly = itemList.filter((i) => i.id > 0);
                setActiveMed(medsOnly.length === 0 ? null : medicineList.find((m) => m.Id === medsOnly[0].id) || null);
            }
        } else {
            setActiveMed(null);
        }
        setMedItemList(itemList);
    }, [activeClient, activeMed]);

    useEffect(() => {
        if (activeClient) {
            const {drugLogList} = activeClient;
            setLastTaken(activeMed?.Id ? calculateLastTaken(activeMed.Id, drugLogList) : null);
        }
    }, [activeClient, activeMed?.Id]);

    // If there isn't an active client, or this isn't the active tab then do not render
    if (activeTabKey !== 'medicine' || !clientId || !activeClient) return null;

    const medicineOtcList = activeClient.medicineList.concat(otcList) as MedicineRecord[];

    /**
     * Given a MedicineRecord object Update or Insert the record and rehydrate the global otcList / medicineList
     * @param {MedicineRecord} med Medicine record object
     */
    const saveMedicine = async (med: MedicineRecord) => {
        await setIsBusy(true);
        const m = await mm.updateMedicine(med);
        if (m.OTC) await setOtcList(await mm.loadOtcList());
        else await setActiveClient({...activeClient, medicineList: await mm.loadMedicineList(clientId)});
        await setIsBusy(false);
        return m;
    };

    /**
     * Given a MedicineRecord PK delete the medicine
     * @param {number} medicineId The PK of the Medicine record to delete
     */
    const deleteMedicine = async (medicineId: number) => {
        await setIsBusy(true);
        if (await mm.deleteMedicine(medicineId))
            await setActiveClient({
                ...activeClient,
                medicineList: await mm.loadMedicineList(clientId)
            });
        await setIsBusy(false);
    };

    /**
     * Given a DrugLogRecord Update or Insert the record and rehydrate the drugLogList
     * @param {DrugLogRecord} drugLog Druglog record object
     */
    const saveDrugLog = async (drugLog: DrugLogRecord): Promise<DrugLogRecord> => {
        await setIsBusy(true);
        const updatedDrugLog = await mm.updateDrugLog(drugLog);
        await setActiveClient({...activeClient, drugLogList: await mm.loadDrugLog(clientId, 5)});
        await setIsBusy(false);
        return updatedDrugLog;
    };

    /**
     * Add or update a pillboxRecord record.
     * @param {PillboxRecord} pillboxRecord Pillbox record object
     */
    const savePillbox = async (pillboxRecord: PillboxRecord) => {
        setActivePillbox(await mm.updatePillbox(pillboxRecord));
        await setActiveClient({...activeClient, pillboxList: await mm.loadPillboxList(clientId)});
    };

    /**
     * Delete an existing pillbox.
     * @param {number} pillboxId The PK for the Pillbox table
     */
    const deletePillbox = async (pillboxId: number) => {
        if (await mm.deletePillbox(pillboxId)) {
            const pbl = await mm.loadPillboxList(clientId);
            await setActiveClient({...activeClient, pillboxList: pbl});
            await setActivePillbox(pbl.length > 0 ? pbl[0] : null);
        }
    };

    /**
     * Fires when user clicks on +Log or the drug log edit button
     * @param {DrugLogRecord} drugLogInfo The drugLog record object
     */
    const addEditDrugLog = (drugLogInfo?: DrugLogRecord) => {
        const drugLogRecord = drugLogInfo
            ? {...drugLogInfo}
            : ({
                  Id: null,
                  ResidentId: clientId,
                  MedicineId: activeMed?.Id,
                  Notes: ''
              } as DrugLogRecord);
        setShowDrugLog(drugLogRecord);
    };

    /**
     * Fires when user clicks on +Log or the drug log edit button for OTC drugs
     * @param {DrugLogRecord} drugLogInfo The drugLog record object
     */
    const addEditOtcLog = (drugLogInfo?: DrugLogRecord) => {
        const drugLogRecord = drugLogInfo
            ? {...drugLogInfo}
            : ({
                  Id: null,
                  ResidentId: clientId,
                  MedicineId: activeOtc?.Id,
                  Notes: ''
              } as DrugLogRecord);
        setShowDrugLog(drugLogRecord);
    };

    /**
     * Fires when the Log 1...4 buttons are clicked.
     * @param {number} amount The number of pills (medication) taken
     */
    const handleLogDrugAmount = (amount: number) => {
        const drugLogInfo = {...newDrugLogRecord};
        drugLogInfo.ResidentId = clientId;
        drugLogInfo.MedicineId = activeMed?.Id as number;
        drugLogInfo.Notes = amount.toString();
        saveDrugLog(drugLogInfo).then((r) => setToast([r]));
    };

    /**
     * Fires when the Log 1 or Log 2, etc. buttons are clicked for OTC drugs
     * @param {number} amount The number of pills (medication) taken
     */
    const handleLogOtcDrugAmount = (amount: number) => {
        const drugId = activeOtc?.Id as number;
        if (drugId) {
            const drugLogInfo = {...newDrugLogRecord};
            drugLogInfo.ResidentId = clientId;
            drugLogInfo.MedicineId = drugId;
            drugLogInfo.Notes = amount.toString();
            saveDrugLog(drugLogInfo).then((r) => setToast([r]));
        }
    };

    /**
     * Convenience function to get drug name
     * @param {number} medicineId The PK of the Medicine table
     * @returns {string | undefined}
     */
    const drugName = (medicineId: number): string | undefined => {
        return getDrugName(medicineId, medicineOtcList);
    };

    /**
     * Handle when the user clicks on Log Pillbox
     */
    const handleLogPillbox = () => {
        /**
         * Log all the pillbox items, refresh the drugLogList, and toast the logged drugs
         * @param {number} pillboxId The PK of the Pillbox table
         */
        const logPillbox = async (pillboxId: number) => {
            const toastQ = [] as DrugLogRecord[];

            // Log drugs in the pillbox
            const loggedPillboxDrugs = await mm.logPillbox(pillboxId);

            // If there are any logged Pillbox drugs then refresh the drugLogList global and toast the success.
            if (loggedPillboxDrugs.length > 0) {
                if (activeClient) {
                    await setActiveClient({...activeClient, drugLogList: await mm.loadDrugLog(clientId, 5)});
                    loggedPillboxDrugs.forEach((ld) => toastQ.push({...ld}));
                    setToast(toastQ);
                }
            }
        };

        // Tell the UI that we're busy. Then log the pillbox contents and when done tell the UI we're no longer busy.
        setIsBusy(true);
        logPillbox(activePillbox?.Id as number).then(() => setIsBusy(false));
    };

    /**
     * Handle when the user has clicked on a pill
     * @param {number} pillboxId The PK of the Pillbox table
     */
    const handleOnPillClick = (pillboxId: number) => {
        if (activeClient) {
            const pb = activeClient.pillboxList.find((p) => p.Id === pillboxId);
            if (pb) {
                setActivePillbox(pb);
                setDisplayType(DISPLAY_TYPE.Pillbox);
            }
        }
    };

    /**
     * Add or update a pillboxItem record
     * @param {PillboxItemRecord} pillboxItemRecord The pillboxItem record object
     */
    const savePillboxItem = async (pillboxItemRecord: PillboxItemRecord) => {
        if (activeClient && (await mm.updatePillboxItem(pillboxItemRecord)))
            await setActiveClient({...activeClient, pillboxItemList: await mm.loadPillboxItemList(clientId as number)});
    };

    if (!activeClient) return null;

    const {drugLogList, pillboxList, pillboxItemList, medicineList} = activeClient;

    return (
        <>
            <Row className={TabContent} noGutters>
                <ListGroup as={Col}>
                    <ListGroup.Item
                        style={{
                            paddingTop: '0.45rem',
                            paddingRight: '1.25rem',
                            paddingBottom: 0,
                            paddingLeft: '1.25rem'
                        }}
                    >
                        <ToggleButton
                            checked={displayType === DISPLAY_TYPE.Medicine}
                            className="d-print-none"
                            id="med-list-group-med-radio-btn"
                            key="med-list-group-med-btn"
                            name="radio-med-list-group"
                            onChange={() => setDisplayType(DISPLAY_TYPE.Medicine)}
                            size="sm"
                            type="radio"
                            value={DISPLAY_TYPE.Medicine}
                            variant="outline-success"
                        >
                            <span className="ml-2">Medicine</span>
                        </ToggleButton>

                        <ToggleButton
                            checked={displayType === DISPLAY_TYPE.OTC}
                            className="ml-2 d-print-none"
                            disabled={otcList?.length === 0}
                            id="med-list-group-otc-radio-btn"
                            key="med-list-group-otc-btn"
                            name="radio-med-list-group"
                            onChange={() => setDisplayType(DISPLAY_TYPE.OTC)}
                            size="sm"
                            type="radio"
                            value={DISPLAY_TYPE.OTC}
                            variant="outline-success"
                        >
                            <span className="ml-2">OTC</span>
                        </ToggleButton>

                        <ToggleButton
                            checked={displayType === DISPLAY_TYPE.History}
                            className="ml-2 d-print-none"
                            disabled={drugLogList.length === 0}
                            id="med-list-group-history-radio-btn"
                            key="med-list-group-history-btn"
                            onChange={() => setDisplayType(DISPLAY_TYPE.History)}
                            size="sm"
                            type="radio"
                            value={DISPLAY_TYPE.History}
                            variant="outline-success"
                        >
                            <span className="ml-2">History</span>
                        </ToggleButton>

                        <ToggleButton
                            checked={displayType === DISPLAY_TYPE.Pillbox}
                            className="ml-2 d-print-none"
                            disabled={medicineList.length < 5}
                            id="med-list-group-pill-radio-btn"
                            key="med-list-group-pill-btn"
                            name="radio-med-list-group"
                            onChange={() => setDisplayType(DISPLAY_TYPE.Pillbox)}
                            size="sm"
                            type="radio"
                            value={DISPLAY_TYPE.Pillbox}
                            variant="outline-success"
                        >
                            <span className="ml-2">Pillbox</span>
                        </ToggleButton>

                        <ToggleButton
                            checked={displayType === DISPLAY_TYPE.Print}
                            className="ml-2 d-print-none"
                            disabled={checkoutList.length === 0}
                            id="med-list-group-print-radio-btn"
                            key="med-list-group-print-btn"
                            name="radio-print-list-group"
                            onChange={() => setDisplayType(DISPLAY_TYPE.Print)}
                            size="sm"
                            type="radio"
                            value={DISPLAY_TYPE.Print}
                            variant="outline-success"
                        >
                            <span className="ml-2">
                                Print Med Checkout{' '}
                                {checkoutList.length > 0 && <Badge variant="secondary">{checkoutList.length}</Badge>}
                            </span>
                        </ToggleButton>
                    </ListGroup.Item>

                    <ListGroup.Item>
                        {displayType === DISPLAY_TYPE.Medicine && (
                            <MedListGroup
                                activeMed={activeMed}
                                addDrugLog={() => addEditDrugLog()}
                                canvasId="med-barcode"
                                clientId={clientId}
                                disabled={isBusy}
                                editMedicine={(medicineRecord) => setShowMedicineEdit(medicineRecord)}
                                itemChanged={(id) => {
                                    if (id < 0) {
                                        setActivePillbox(pillboxList.find((p) => p.Id === Math.abs(id)) || null);
                                        setDisplayType(DISPLAY_TYPE.Pillbox);
                                    } else {
                                        setActiveMed(medicineList.find((m) => m.Id === id) || null);
                                    }
                                }}
                                itemList={medItemList}
                                lastTaken={activeMed?.Id ? calculateLastTaken(activeMed.Id, drugLogList) : null}
                                logDrug={(n) => handleLogDrugAmount(n)}
                            />
                        )}

                        {displayType === DISPLAY_TYPE.OTC && (
                            <OtcListGroup
                                activeOtc={activeOtc}
                                disabled={otcList.length === 0 || isBusy}
                                drugLogList={drugLogList}
                                editOtcMedicine={(medicineRecord) => setShowMedicineEdit(medicineRecord)}
                                logOtcDrug={() => addEditOtcLog()}
                                logOtcDrugAmount={(n) => handleLogOtcDrugAmount(n)}
                                otcList={otcList}
                                otcSelected={(medicineRecord) => setActiveOtc(medicineRecord)}
                            />
                        )}

                        {displayType === DISPLAY_TYPE.Pillbox && (
                            <PillboxListGroup
                                activePillbox={activePillbox}
                                clientRecord={activeClient.clientInfo}
                                disabled={isBusy}
                                gridLists={{
                                    medicineList: medicineList.filter((m) => m.Active),
                                    pillboxList,
                                    pillboxItemList,
                                    drugLogList
                                }}
                                logPillbox={() => handleLogPillbox()}
                                onDelete={(pillboxId) => deletePillbox(pillboxId)}
                                onEdit={(pillboxRecord) => savePillbox(pillboxRecord)}
                                onSelect={(pillboxId) =>
                                    setActivePillbox(pillboxList.find((pb) => pb.Id === pillboxId) || null)
                                }
                                pillboxMedLogList={pillboxMedLogList}
                            />
                        )}

                        {displayType === DISPLAY_TYPE.History && activeClient && activeClient.clientInfo && (
                            <ListGroup className="d-print-flex">
                                <ListGroup.Item>
                                    <MedDrugLogHistory
                                        activeClient={activeClient.clientInfo}
                                        gridLists={{
                                            drugLogList,
                                            pillboxList,
                                            pillboxItemList,
                                            medicineList: medicineList.concat(otcList)
                                        }}
                                        onEdit={(drugLogRecord) => addEditDrugLog(drugLogRecord)}
                                        onDelete={(drugLogRecord) => setShowDeleteDrugLogRecord(drugLogRecord)}
                                        onPillClick={(pillboxId) => handleOnPillClick(pillboxId)}
                                    />
                                </ListGroup.Item>
                            </ListGroup>
                        )}

                        {displayType === DISPLAY_TYPE.Print && activeClient && activeClient?.clientInfo && (
                            <CheckoutListGroup
                                activeClient={activeClient.clientInfo}
                                checkoutList={checkoutList}
                                medicineList={medicineList}
                            />
                        )}
                    </ListGroup.Item>
                </ListGroup>

                {displayType !== DISPLAY_TYPE.Print && displayType !== DISPLAY_TYPE.History && (
                    <ListGroup as={Col} className="ml-3">
                        {displayType === DISPLAY_TYPE.Medicine && (
                            <ListGroup.Item style={{textAlign: 'center'}}>
                                <Button
                                    className="hover-underline-animation"
                                    href={`https://goodrx.com/${activeMed?.Drug}`}
                                    size="lg"
                                    target="_blank"
                                    variant="link"
                                >
                                    {activeMed?.Drug}
                                </Button>

                                <LastTakenButton lastTaken={lastTaken} />

                                {activeMed?.Id && (
                                    <DrugLogGrid
                                        columns={['Taken', 'Notes', 'Out', 'In']}
                                        drugId={activeMed.Id}
                                        gridLists={{medicineList, drugLogList, pillboxList, pillboxItemList}}
                                        onDelete={(drugLogRecord) => setShowDeleteDrugLogRecord(drugLogRecord)}
                                        onEdit={(r) => addEditDrugLog(r)}
                                        onPillClick={(n) => handleOnPillClick(n)}
                                    />
                                )}
                            </ListGroup.Item>
                        )}

                        {displayType === DISPLAY_TYPE.OTC && (
                            <ListGroup.Item>
                                <h5 className="mb-2" style={{textAlign: 'center'}}>
                                    OTC History
                                </h5>
                                <DrugLogGrid
                                    columns={['Drug', 'Taken', 'Notes']}
                                    onDelete={(drugLogRecord) => setShowDeleteDrugLogRecord(drugLogRecord)}
                                    onEdit={(drugLogRecord) => addEditOtcLog(drugLogRecord)}
                                    gridLists={{
                                        medicineList: otcList,
                                        drugLogList: otcLogList,
                                        pillboxList: undefined,
                                        pillboxItemList: undefined
                                    }}
                                />
                            </ListGroup.Item>
                        )}

                        {displayType === DISPLAY_TYPE.Pillbox && activePillbox && activePillbox.Id && (
                            <PillboxCard
                                activePillbox={activePillbox}
                                medicineList={medicineList}
                                onEdit={(pillboxItemRecord) => savePillboxItem(pillboxItemRecord)}
                                pillboxItemList={pillboxItemList}
                            />
                        )}
                    </ListGroup>
                )}
            </Row>

            <MedicineEdit
                allowDelete={!drugLogList.find((d) => d.MedicineId === showMedicineEdit?.Id)}
                drugInfo={showMedicineEdit as MedicineRecord}
                fullName={clientFullName(activeClient.clientInfo)}
                onClose={(medicineRecord) => {
                    setShowMedicineEdit(null);
                    if (medicineRecord) {
                        if (medicineRecord.Id && medicineRecord.Id < 0) {
                            setShowDeleteMedicine(Math.abs(medicineRecord.Id));
                        } else {
                            saveMedicine(medicineRecord).then((medicineRecord) => {
                                if (medicineRecord.OTC) {
                                    setActiveOtc(medicineRecord.Active ? medicineRecord : null);
                                } else {
                                    const activeMeds = medicineList.filter((m) => m.Active);
                                    setActiveMed(
                                        medicineRecord.Active
                                            ? medicineRecord
                                            : activeMeds.length === 0
                                            ? null
                                            : activeMeds[0]
                                    );
                                }
                            });
                        }
                    }
                }}
                show={showMedicineEdit !== null}
            />

            <DrugLogEdit
                drugLogInfo={showDrugLog as DrugLogRecord}
                drugName={getMedicineRecord(showDrugLog?.MedicineId as number, medicineOtcList)?.Drug || '[unknown]'}
                onClose={(drugLogRecord) => {
                    setShowDrugLog(null);
                    if (drugLogRecord)
                        saveDrugLog(drugLogRecord).then((updatedDrugLogRecord) => setToast([updatedDrugLogRecord]));
                }}
                onHide={() => setShowDrugLog(null)}
                otc={getMedicineRecord(showDrugLog?.MedicineId as number, medicineOtcList)?.OTC || false}
                show={showDrugLog !== null}
            />

            <DeleteDrugLogModal
                drugLogRecord={showDeleteDrugLogRecord as DrugLogRecord}
                drugName={showDeleteDrugLogRecord ? drugName(showDeleteDrugLogRecord.MedicineId) || '' : ''}
                onSelect={(drugLogRecord) => {
                    setShowDeleteDrugLogRecord(null);
                    if (drugLogRecord)
                        mm.deleteDrugLog(showDeleteDrugLogRecord?.Id as number).then(() => {
                            mm.loadDrugLog(clientId, 5).then((drugLogRecords) => {
                                setActiveClient({...activeClient, drugLogList: drugLogRecords});
                            });
                        });
                }}
                show={showDeleteDrugLogRecord !== null}
            />

            <DeleteMedicineModal
                medicineRecord={medicineList.find((m) => m.Id === showDeleteMedicine) as MedicineRecord}
                onSelect={(medicineId) => {
                    setShowDeleteMedicine(0);
                    if (medicineId > 0) {
                        deleteMedicine(medicineId).then(() => {
                            if (medicineList.length > 0) setActiveMed(medicineList[0]);
                            else setActiveMed(null);
                        });
                    }
                }}
                show={showDeleteMedicine !== 0}
            />

            <DrugLogToast
                medicineList={medicineOtcList}
                onClose={() => setToast(null)}
                show={toast !== null}
                toast={toast as DrugLogRecord[]}
            />
        </>
    );
};

export default MedicinePage;
