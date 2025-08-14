"use client"

import React from "react"
import PhoneInputBase from "react-phone-input-2"
import "react-phone-input-2/lib/style.css"


interface PhoneInputProps {
  value: string
  onChange: (value: string) => void
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>
}

export function PhoneInput({ value, onChange, inputProps }: PhoneInputProps) {
  return (
    <PhoneInputBase
      country={"my"} // default to Malaysia
      value={value}
      onChange={onChange}
      inputProps={{
        name: "phone",
        required: true,
        autoFocus: false,
        ...inputProps,
      }}
      containerStyle={{ width: "100%" }}
      inputStyle={{
        width: "100%",
        height: "40px",
        fontSize: "14px",
        paddingLeft: "48px",
      }}
      buttonStyle={{
        border: "none",
        background: "transparent",
      }}
    />
  )
}
