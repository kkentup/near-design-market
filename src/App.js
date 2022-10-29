import React, { useEffect, useCallback, useState } from "react";
import { Container, Nav } from "react-bootstrap";
import { login, logout, accountBalance } from "./utils/near";
import Wallet from "./components/Wallet";
import { Notification } from "./components/utils/Notifications";
import Designs from "./components/marketplace/Designs";
import Cover from "./components/utils/Cover";
import coverImg from "./images/cover.jpg";
import "./App.css";

const App = function AppWrapper() {
    const account = window.walletConnection.account();

    const [balance, setBalance] = useState("0");

    const getBalance = useCallback(async () => {
        if (account.accountId) {
            setBalance(await accountBalance());
        }
    });

    useEffect(() => {
        getBalance();
    }, [getBalance]);

    return (
        <>
            <Notification />
            {account.accountId ? (
                <Container fluid="md">
                    <Nav className="justify-content-end pt-3 pb-5">
                        <Nav.Item>
                            <Wallet
                                address={account.accountId}
                                amount={balance}
                                symbol="NEAR"
                                logout={logout}
                            />
                        </Nav.Item>
                    </Nav>
                    <main>
                        <Designs />
                    </main>
                </Container>
            ) : (
                <Cover name="Design Market" login={login} coverImg={coverImg} />
            )}
        </>
    );
};

export default App;
