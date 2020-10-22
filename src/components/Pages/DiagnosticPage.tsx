import React, {useGlobal} from 'reactn';
import {Alert, Button, Card} from "react-bootstrap";
import {ReactNode, useEffect, useMemo, useState} from "react";

interface IProps {
    error: any
    dismissErrorAlert: () => void
}

/**
 * DiagnosticPage
 * @param {IProps} props
 * @return {JSX.Element | null}
 */
const DiagnosticPage = (props: IProps): JSX.Element | null => {
    const [content, setContent] = useState<JSX.Element | null>(null);
    const [development] = useGlobal('development');
    const dismissError = props.dismissErrorAlert;
    const error = props.error;
    let finalContent: JSX.Element | null;

    /**
     * Function to create the unsafe HTML object
     * @param {string} html
     * @return {object}
     */
    const createMarkup = (html: string): { __html: string } => {
        return {__html: html}
    };

    /**
     * Get the text from a Response object.
     * @param {Response} response
     */
    const getText = async (response: Response) => {
        return await response.text();
    }

    // Observer to show / hide the Diagnostics tab title
    useEffect(() => {
        const el = document.getElementById('landing-page-tabs-tab-error');
        if (error) {
            if (el) {
                el.style.color = '#007BFF';
            }
        } else {
            if (el) {
                el.style.color = 'white';
            }
        }
    }, [error])

    /**
     * Use memoization so we don't have 3000 re-renders when an error occurs.
     */
    finalContent = useMemo(() => {
        /**
         * Alert composition component
         * @param {ReactNode} heading
         * @param {ReactNode} body
         */
        const _alert = (heading: ReactNode, body: ReactNode) => {
            return (
                <Alert
                    variant="danger"
                    dismissible
                    onClose={() => dismissError()}
                >
                    <Alert.Heading>
                        {heading}
                    </Alert.Heading>
                    {body}
                </Alert>
            )
        }

        /**
         * Handler for when error is an instance of Error
         * @param {Error} err
         */
        const handleNativeError = (err: Error) => {
            const message = err.message;
            const name = err.name;
            const stack = err?.stack;
            const body = (
                <>
                    <p>{message}</p>
                    {stack &&
                    <>
                        <p></p>
                        <p>{stack}</p>
                    </>
                    }
                </>
            )
            setContent(_alert('Error (' + name + ')', body));
        }

        /**
         * Handler for when the error contains HTML that needs to be rendered.
         * @param {string} html
         */
        const handleHtmlError = (html: string) => {
            const card = (
                <Card>
                    <Card.Body>
                        <div dangerouslySetInnerHTML={createMarkup(html)}/>
                    </Card.Body>
                    <Card.Footer>
                        <Button
                            variant="primary"
                            onClick={() => dismissError()}
                        >
                            Close error and sign back in
                        </Button>
                    </Card.Footer>
                </Card>
            )
            setContent(card);
        }

        /**
         * Handler for when the error is an instance of Response
         * @param {Response} err
         */
        const handleResponseError = async (err: Response) => {
            console.log('handleResponseError', err);
            return await getText(err).then((text) => {
                const headers = err.headers;
                const contentType = (headers.has('content_type')) ? headers.get('content_type') : '';
                if (text.toLowerCase().includes('html') || contentType?.toLowerCase().includes('html')) {
                    handleHtmlError(text);
                } else {
                    setContent(_alert('Fetch Error',
                        <>
                            <p>Status: {error.status}</p>
                            <p>Stats Text: {error.statusText}</p>
                            <p>Text: {text}</p>
                        </>));
                }
            });
        }

        if (!error) {
            return null;
        }

        try {
            if (development) {
                console.log('Error:', error);
                console.log('typeof error', typeof error);

                if (content) {
                    return content;
                }

                /**
                 * 🦆 typing to figure out what type error is
                 */
                if (error instanceof Response) {
                    handleResponseError(error);
                }
                if (error instanceof Error) {
                    handleNativeError(error);
                }
                // Willow/Slim fetch error
                if (typeof error === 'object' &&
                        error.hasOwnProperty('content_type') &&
                        error.hasOwnProperty('text')) {
                    if (error.content_type.toLowerCase().includes('html')
                        && error.text.toLowerCase().includes('html')) {
                            handleHtmlError(error.text);
                    }
                }
                if (typeof error === 'string') {
                    if (error.toLowerCase().includes('html')) {
                        return handleHtmlError(error);
                    } else {
                        return handleNativeError(new Error(error));
                    }
                }
                return (_alert(<b>Unknown Error</b>, 'Check console log.'));
            } else {
                return (_alert(<b>'Error'</b>, 'Something went wrong. Check your internet connection and try again.'));
            }
        } catch (e) {
            return (<><p>Error in DiagnosticsPage</p></>);
        }
    }, [error, development, content, dismissError]) || null;

    return <>{finalContent}</>
}

export default DiagnosticPage;
