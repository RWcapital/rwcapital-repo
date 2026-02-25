"use client";

import { deleteClient } from "./actions";

export function DeleteClientButton({
  clientId,
  clientName,
}: {
  clientId: string;
  clientName: string;
}) {
  return (
    <form
      action={async () => {
        if (
          !confirm(
            `¿Eliminar cliente "${clientName}"?\n\nSe eliminarán todos sus documentos y asignaciones. Esta acción no se puede deshacer.`,
          )
        )
          return;
        await deleteClient(clientId);
      }}
    >
      <button
        type="submit"
        className="text-xs font-medium text-red-400 hover:text-red-600"
      >
        Eliminar
      </button>
    </form>
  );
}
