import { useMemo, useCallback } from 'react';
import { useAccount, useBalance, useDisconnect, useSendTransaction } from 'wagmi';
import { useAppKit } from '@reown/appkit/react';
import { useHedera } from './useHedera';
import { parseEther } from 'viem';

export const useDualWallet = () => {
    // 1. EVM (AppKit)
    const { address: evmAddress, isConnected: isEvmConnected } = useAccount();
    const { data: evmBalanceData } = useBalance({ address: evmAddress });
    const { disconnect: disconnectEvm } = useDisconnect();
    const { open: openAppKit } = useAppKit();
    const { sendTransactionAsync } = useSendTransaction();

    // 2. Native (HashConnect)
    const { 
        connected: isNativeConnected, 
        accountId: nativeAddress, 
        disconnect: disconnectNative,
        connect: connectNative,
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

    // 4. Robust Actions
    const openWalletModal = useCallback(() => {
        console.log("UPLINK // TRIGGERING_REOWN_MODAL");
        if (openAppKit) openAppKit();
    }, [openAppKit]);

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
