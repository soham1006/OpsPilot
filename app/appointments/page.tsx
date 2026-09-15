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
            <thead className="border-b border-black/10 bg-[#faf9f6] text-xs uppercase tracking-wider text-black/40">
              <tr>
                <th className="px-5 py-3">Appointment</th>
                <th className="px-5 py-3">Customer</th>
                <th className="px-5 py-3">Service</th>
                <th className="px-5 py-3">Schedule</th>
                <th className="px-5 py-3">Technician</th>
                <th className="px-5 py-3">Status</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-black/8">
              {appointments.map((appointment) => (
                <tr
                  key={appointment.id}
                  data-appointment-id={appointment.id}
                  className="hover:bg-[#faf9f6]"
                >
                  <td className="px-5 py-4 font-medium">
                    {appointment.id}
                  </td>

                  <td className="px-5 py-4">
                    <div>{appointment.customer_name}</div>
                    <div className="text-xs text-black/40">
                      {appointment.customer_id}
                    </div>
                  </td>

                  <td className="px-5 py-4">{appointment.service}</td>

                  <td className="px-5 py-4">
                    {formatDate(appointment.scheduled_start)}
                  </td>

                  <td className="px-5 py-4">
                    {appointment.technician ?? "Unassigned"}
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