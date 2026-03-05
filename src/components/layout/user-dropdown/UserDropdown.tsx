import { DropdownMenu } from "../../ui/dropdown-menu"
import { useAuthStore } from "../../../store/authStore"
import { TriggerButton } from "./TriggerButton"
import { GuestDropdownContent } from "./GuestDropdownContent"
import { UserDropdownContent } from "./UserDropdownContent"

export default function UserDropdown() {
    const { isAuthenticated } = useAuthStore()
    // const authenticated = isAuthenticated()

    return (
        <DropdownMenu>
            <TriggerButton isAuthenticated={isAuthenticated} />
            {isAuthenticated ? <UserDropdownContent /> : <GuestDropdownContent />}
        </DropdownMenu>
    )
}
