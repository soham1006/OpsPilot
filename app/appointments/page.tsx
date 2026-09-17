import NorthstarShell from "@/components/northstar/NorthstarShell";
import StatusBadge from "@/components/northstar/StatusBadge";
import { getAppointments } from "@/lib/db/northstar";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default function AppointmentsPage() {
  const appointments = getAppointments();

  return (
    <NorthstarShell
      title="Appointments"
      description="Scheduled field-service appointments and technician assignments."
    >
      <div className="overflow-hidden rounded-xl border border-black/10 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
  <thead className="border-b border-black/[0.08] bg-[#faf9f6]">
    <tr>
      <th className="px-5 py-3 text-[10px] font-medium uppercase tracking-[0.12em] text-black/40">
        Appointment
      </th>

      <th className="px-5 py-3 text-[10px] font-medium uppercase tracking-[0.12em] text-black/40">
        Customer
      </th>

      <th className="px-5 py-3 text-[10px] font-medium uppercase tracking-[0.12em] text-black/40">
        Service
      </th>

      <th className="px-5 py-3 text-[10px] font-medium uppercase tracking-[0.12em] text-black/40">
        Schedule
      </th>

      <th className="px-5 py-3 text-[10px] font-medium uppercase tracking-[0.12em] text-black/40">
        Technician
      </th>

      <th className="px-5 py-3 text-[10px] font-medium uppercase tracking-[0.12em] text-black/40">
        Status
      </th>
    </tr>
  </thead>

  <tbody className="divide-y divide-black/[0.07]">
    {appointments.map((appointment) => (
      <tr
        key={appointment.id}
        data-appointment-id={appointment.id}
        className="group transition-colors hover:bg-[#faf9f6]"
      >
        <td className="px-5 py-4">
          <div className="font-semibold text-[#20201d]">
            {appointment.id}
          </div>

          <div className="mt-0.5 text-[11px] text-black/35">
            Field appointment
          </div>
        </td>

        <td className="px-5 py-4">
          <div className="font-medium text-[#20201d]">
            {appointment.customer_name}
          </div>

          <div className="mt-0.5 text-[11px] text-black/40">
            {appointment.customer_id}
          </div>
        </td>

        <td className="px-5 py-4">
          <span className="text-[13px] text-black/70">
            {appointment.service}
          </span>
        </td>

        <td className="px-5 py-4">
          <div className="text-[13px] font-medium text-[#20201d]">
            {formatDate(appointment.scheduled_start)}
          </div>

          <div className="mt-0.5 text-[11px] text-black/40">
            Scheduled start
          </div>
        </td>

        <td className="px-5 py-4">
          <span className="text-[13px] text-black/65">
            {appointment.technician ?? "Unassigned"}
          </span>
        </td>

        <td className="px-5 py-4">
          <StatusBadge value={appointment.status} />
        </td>
      </tr>
    ))}
  </tbody>
</table>
        </div>
      </div>
    </NorthstarShell>
  );
}