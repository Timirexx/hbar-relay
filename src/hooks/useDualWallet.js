import { useMemo } from 'react';
import { useAccount, useBalance, useDisconnect } from 'wagmi';
import { useHedera } from './useHedera';

export const useDualWallet = () => {
    // EVM Side (Wagmi / Reown)
    const { address: evmAddress, isConnected: isEvmConnected } = useAccount();
    const { data: evmBalance } = useBalance({ address: evmAddress });
    const { disconnect: disconnectEvm } = useDisconnect();

    // Native Side (HashConnect)
    const { 
        connected: isNativeConnected, 
        accountId: nativeAddress, 
        disconnect: disconnectNative,
        connect: connectNative,
        isConnecting: isNativeConnecting
    } = useHedera();

    // Consistently handle connection state
    const isConnected = isEvmConnected || isNativeConnected;
    const walletType = isEvmConnected ? 'evm' : (isNativeConnected ? 'native' : null);

    // Normalized Address
    const address = useMemo(() => {
        if (isEvmConnected) return evmAddress;
        if (isNativeConnected) return nativeAddress;
        return null;
    }, [evmAddress, nativeAddress, isEvmConnected, isNativeConnected]);

    // Normalized Balance (in HBAR)
    const balance = useMemo(() => {
        if (isEvmConnected && evmBalance) {
            return `${parseFloat(evmBalance.formatted).toFixed(2)} HBAR`;
        }
        // For native, we would ideally fetch the balance here if not already in useHedera
        // For now, returning a placeholder or fetching logic could be added
        return isNativeConnected ? "FETCHING..." : "0 HBAR";
    }, [evmBalance, isEvmConnected, isNativeConnected]);

    const disconnect = () => {
        if (isEvmConnected) disconnectEvm();
        if (isNativeConnected) disconnectNative();
    };

    return {
        isConnected,
        walletType,
        address,
        balance,
        disconnect,
        connectNative,
        isNativeConnecting,
        // Expose original hooks if needed for specific actions
        evm: { address: evmAddress, isConnected: isEvmConnected },
        native: { accountId: nativeAddress, isConnected: isNativeConnected }
    };
};
