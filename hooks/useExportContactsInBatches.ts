import { useCallback, useEffect, useState } from "react";
import * as Contacts from "expo-contacts";
import { Platform } from "react-native";

const DEFAULT_PAGE_SIZE = 50;

export type FetchedContactBatch =
  | {
      status: Contacts.PermissionStatus.GRANTED;
      hasNextPage: boolean;
      data: Contacts.Contact[];
    }
  | {
      status:
        | Contacts.PermissionStatus.DENIED
        | Contacts.PermissionStatus.UNDETERMINED;
      data: undefined;
    };

const fetchContacts = async (
  offset = 0,
  limit = DEFAULT_PAGE_SIZE
): Promise<FetchedContactBatch> => {
  const { status } = await Contacts.requestPermissionsAsync();
  if (status === Contacts.PermissionStatus.GRANTED) {
    const { data, hasNextPage } = await Contacts.getPagedContactsAsync({
      pageOffset: offset,
      pageSize: limit,
      fields: [
        Contacts.Fields.ID,
        Contacts.Fields.Emails,
        Contacts.Fields.PhoneNumbers,
        Contacts.Fields.FirstName,
        Contacts.Fields.LastName,
      ],
    });
    return { status, data, hasNextPage };
  } else if (status === Contacts.PermissionStatus.DENIED) {
    return { status, data: undefined };
  } else {
    status satisfies Contacts.PermissionStatus.UNDETERMINED;
    return { status, data: undefined };
  }
};

export default function useExportContactsInBatches(
  pageSize = DEFAULT_PAGE_SIZE
) {
  const isWeb = Platform.OS === "web";
  const [hasNext, setHasNext] = useState(true && !isWeb);
  const [hasError, setHasError] = useState(false || isWeb);
  const [offset, setOffset] = useState(0);

  const next = useCallback(async () => {
    if (!hasNext || hasError) {
      return { status: Contacts.PermissionStatus.DENIED, data: undefined };
    }

    console.log("Next was called");
    const fetchedContacts = await fetchContacts(offset, pageSize);

    setOffset(offset + pageSize);
    setHasNext(
      fetchedContacts.status === Contacts.PermissionStatus.GRANTED &&
        fetchedContacts.hasNextPage
    );
    setHasError(fetchedContacts.status !== Contacts.PermissionStatus.GRANTED);

    return fetchedContacts;
  }, [offset]);

  return { next, hasNext, hasError };
}
