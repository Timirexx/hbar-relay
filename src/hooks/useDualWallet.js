import { useMemo } from 'react';
import { useAccount, useBalance, useDisconnect } from 'wagmi';
import { useAppKit } from '@reown/appkit/react';
import { useHedera } from './useHedera';

export const useDualWallet = () => {
    // EVM Side (Wagmi / Reown)
    const { address: evmAddress, isConnected: isEvmConnected } = useAccount();
    const { data: evmBalance } = useBalance({ address: evmAddress });
    const { disconnect: disconnectEvm } = useDisconnect();
    const { open: openAppKit } = useAppKit();

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

    // Normalized Address (Truncated)
    const address = useMemo(() => {
        if (isEvmConnected && evmAddress) return evmAddress;
        if (isNativeConnected && nativeAddress) return nativeAddress;
        return null;
    }, [evmAddress, nativeAddress, isEvmConnected, isNativeConnected]);

    // Normalized Balance (in HBAR, rounded to 2 decimal places)
    const balance = useMemo(() => {
        if (isEvmConnected && evmBalance) {
            const formatted = parseFloat(evmBalance.formatted);
            return `${formatted.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} HBAR`;
        }
        if (isNativeConnected) return "FETCHING...";
        return "0.00 HBAR";
    }, [evmBalance, isEvmConnected, isNativeConnected]);

    // Helper functions requested by user
    const openWalletModal = () => openAppKit();
    
    const disconnectWallet = () => {
        if (isEvmConnected) disconnectEvm();
        if (isNativeConnected) disconnectNative();
    };

    return {
        // User requested fields
        openWalletModal,
        disconnectWallet,
        isConnected,
        address,
        balance,
        
        // Extended fields for dual support
        walletType,
        connectNative,
        isNativeConnecting,
        evm: { address: evmAddress, isConnected: isEvmConnected },
        native: { accountId: nativeAddress, isConnected: isNativeConnected }
    };
};
