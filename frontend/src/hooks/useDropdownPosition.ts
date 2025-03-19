import { useState, useEffect } from "react";

const useDropdownPosition = (
  dropdownRef: React.RefObject<HTMLDivElement | null>,
  dropdownContentRef: React.RefObject<HTMLDivElement | null>,
  isCalendarDropdownOpen: boolean,
) => {
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});

  useEffect(() => {
    const adjustDropdownPosition = () => {
      if (dropdownRef.current && dropdownContentRef.current && isCalendarDropdownOpen) {
        const dropdownRect = dropdownRef.current.getBoundingClientRect();
        const dropdownContentHeight = dropdownContentRef.current.offsetHeight;
        const windowHeight = window.innerHeight || document.documentElement.clientHeight;
        const spaceBelow = windowHeight - dropdownRect.bottom;
        const spaceAbove = dropdownRect.top;

        if (spaceBelow < dropdownContentHeight && spaceAbove > dropdownContentHeight) {
          setDropdownStyle({ bottom: "100%", top: "auto" });
        } else {
          setDropdownStyle({ top: "100%", bottom: "auto" });
        }
      } else {
        setDropdownStyle({});
      }
    };

    adjustDropdownPosition();

    window.addEventListener("resize", adjustDropdownPosition);

    return () => {
      window.removeEventListener("resize", adjustDropdownPosition);
    };
  }, [isCalendarDropdownOpen, dropdownRef, dropdownContentRef]);

  return dropdownStyle;
};

export default useDropdownPosition;
