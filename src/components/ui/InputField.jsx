import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../theme/ThemeContext';
import { tokens } from '../../theme/tokens';

/**
 * InputField Component
 * 
 * Semi-transparent input field with glow focus effect.
 * 
 * Props:
 * - value: string - Input value
 * - onChange: function - Change handler
 * - placeholder: string - Placeholder text
 * - label: string - Optional label
 * - suffix: string - Optional suffix text (e.g., "USDC")
 * - type: string - Input type (default: "text")
 * - disabled: boolean - Disable state
 * - error: string - Error message
 * - className: string - Additional CSS classes
 */

const InputField = ({
  value,
  onChange,
  placeholder = '',
  label,
  suffix,
  type = 'text',
  disabled = false,
  error,
  className = '',
  style = {},
  inputStyle = {},
}) => {
  const { isDark } = useTheme();
  const currentTokens = isDark ? tokens.dark : tokens.light;
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef(null);

  // Focus management
  const handleFocus = () => setIsFocused(true);
  const handleBlur = () => setIsFocused(false);

  // Auto-focus on mount if needed
  useEffect(() => {
    if (inputRef.current && inputRef.current.hasAttribute('autofocus')) {
      inputRef.current.focus();
    }
  }, []);

  return (
    <div
      className={`input-field-container ${className}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
        ...style,
      }}
    >
      {label && (
        <label
          className="label"
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '14px',
            fontWeight: '500',
            color: 'var(--on-surface-variant)',
          }}
        >
          {label}
        </label>
      )}

      <div style={{
        position: 'relative',
      }}>
        <motion.input
          ref={inputRef}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          onFocus={handleFocus}
          onBlur={handleBlur}
          className="input-field"
          style={{
            width: '100%',
            padding: suffix ? 'var(--spacing-sm) var(--spacing-xl)' : 'var(--spacing-sm) var(--spacing-md)',
            paddingRight: suffix ? '48px' : undefined,
            fontFamily: 'var(--font-mono)',
            fontSize: '14px',
            fontWeight: '500',
            color: 'var(--on-surface)',
            background: currentTokens.surfaceGlass,
            border: `1px solid ${currentTokens.borderGlass}`,
            borderColor: isFocused 
              ? currentTokens.primaryContainer 
              : error 
                ? currentTokens.errorContainer 
                : currentTokens.borderGlass,
            borderRadius: 'var(--rounded-interactive)',
            outline: 'none',
            transition: 'all var(--transition-fast)',
            boxShadow: isFocused 
              ? `0 0 0 3px rgba(0, 255, 163, ${isDark ? 0.15 : 0.1}), 0 0 15px rgba(0, 255, 163, ${isDark ? 0.25 : 0.15})`
              : error 
                ? `0 0 0 3px rgba(255, 180, 171, 0.15)`
                : 'none',
            ...inputStyle,
          }}
          whileHover={{ borderColor: currentTokens.primaryFixedDim }}
        />

        {suffix && (
          <div style={{
            position: 'absolute',
            right: 'var(--spacing-md)',
            top: '50%',
            transform: 'translateY(-50%)',
            fontFamily: 'var(--font-mono)',
            fontSize: '12px',
            fontWeight: '500',
            color: 'var(--on-surface-variant)',
            pointerEvents: 'none',
          }}>
            {suffix}
          </div>
        )}
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
            color: currentTokens.error,
          }}
        >
          {error}
        </motion.div>
      )}
    </div>
  );
};

export default InputField;
