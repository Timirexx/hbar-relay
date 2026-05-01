import { useMemo, useCallback } from 'react';
import { useAccount, useBalance, useDisconnect, useSendTransaction } from 'wagmi';
import { useHedera } from './useHedera';
import { parseEther } from 'viem';
import { appkitInstance } from '../config/appkit';
import { hcInstance } from '../config/hashconnect';

export const useDualWallet = () => {
    // 1. EVM (Standard Wagmi)
    const { address: evmAddress, isConnected: isEvmConnected } = useAccount();
    const { data: evmBalanceData } = useBalance({ address: evmAddress });
    const { disconnect: disconnectEvm } = useDisconnect();
    const { sendTransactionAsync } = useSendTransaction();

    // 2. Native (Refined useHedera)
    const { 
        connected: isNativeConnected, 
        accountId: nativeAddress, 
        disconnect: disconnectNative,
        isConnecting: isNativeConnecting,
        initiateEntryFee,
        reportScore
    } = useHedera();

    // 3. Unified State
    const isConnected = isEvmConnected || isNativeConnected;
    const walletType = isEvmConnected ? 'evm' : (isNativeConnected ? 'native' : null);
    const address = isEvmConnected ? evmAddress : nativeAddress;

    const balance = useMemo(() => {
        if (isEvmConnected && evmBalanceData) {
            const val = parseFloat(evmBalanceData.formatted);
            return `${val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} HBAR`;
        }
        if (isNativeConnected) return "SYNCED";
        return "0.00 HBAR";
    }, [evmBalanceData, isEvmConnected, isNativeConnected]);

    // 4. Hyper-Link Actions (Direct Singletons)
    const openWalletModal = useCallback(() => {
        console.log("UPLINK // TRIGGERING_DIRECT_APPKIT_HANDSHAKE");
        // Direct call to singleton bypassing hooks
        appkitInstance.open();
    }, []);

    const connectNative = useCallback(async () => {
        console.log("UPLINK // TRIGGERING_DIRECT_HASHPACK_HANDSHAKE");
        // Direct call to singleton
        await hcInstance.connectToLocalWallet();
    }, []);

    const disconnectWallet = useCallback(() => {
        if (isEvmConnected) disconnectEvm();
        if (isNativeConnected) disconnectNative();
    }, [isEvmConnected, isNativeConnected, disconnectEvm, disconnectNative]);

    const payEntryFee = async () => {
        if (isEvmConnected) {
            return await sendTransactionAsync({
                to: '0x0000000000000000000000000000000000843922',
                value: parseEther('0.0001'), 
            });
        }
        return await initiateEntryFee();
    };

    return {
        isConnected,
        address,
        balance,
        walletType,
        openWalletModal,
        connectNative,
        disconnectWallet,
        payEntryFee,
        submitScore: isNativeConnected ? reportScore : (score) => console.log("EVM_SCORE:", score),
        isNativeConnecting
    };
};
