import React from 'reactn';
import Button from 'react-bootstrap/Button';
import Table from 'react-bootstrap/Table';

/**
 * DrugLogGrid
 *
 * @param {object} props
 *                 props.drugLog {array<object>}
 *                 props.onEdit {cb}
 *                 props.onDelete {cb}
 *                 props.drugId {number}
 * @returns {null|*}
 */
export default function DrugLogGrid(props)
{
    if (!props.drugLog) {
        return null;
    }

    const drugList = props.drugLog;
    const drugId = props.drugId;
    const filteredDrugs = drugId && drugList ? drugList.filter(drug => drug.MedicineId === drugId) : drugList;

    const DrugRow = (drug) => {
        return (
            <tr
                key={'druglog-grid-row-' + drug.Id}
                id={'druglog-grid-row-' + drug.Id}
            >
                {props.onEdit &&
                    <td>
                        <Button
                            size="sm"
                            id={"druglog-grid-edit-btn-" + drug.Id}
                            onClick={(e) => props.onEdit(e, drug)}
                        >
                            Edit
                        </Button>
                    </td>
                }
                <td>{drug.Created}</td>
                <td>{drug.Updated}</td>
                <td>{drug.Notes}</td>
                {props.onDelete &&
                <td>
                    <Button
                        size="sm"
                        id={"resident-grid-delete-btn-" + drug.Id}
                        variant="outline-danger"
                        onClick={(e) => props.onDelete(e, drug)}
                    >
                        <span role="img" aria-label="delete">🗑️</span>
                    </Button>
                </td>
                }
            </tr>
        );
    };

    return (
        <Table striped bordered hover size="sm">
            <thead>
            <tr>
                {props.onEdit &&
                    <th> </th>
                }
                <th>
                    <span>Created</span>
                </th>
                <th>
                    <span>Updated</span>
                </th>
                <th>
                    <span>Amount Taken/Notes</span>
                </th>
                {props.onDelete &&
                    <th> </th>
                }
            </tr>
            </thead>
            <tbody>
                {drugList && drugList.length && filteredDrugs.map(DrugRow)}
            </tbody>
        </Table>
    );
}