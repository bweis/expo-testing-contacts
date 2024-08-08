import { Button, Text, View } from "react-native";
import useExportContactsInBatches from "@/hooks/useExportContactsInBatches";
import { useState } from "react";
import { Contact } from "expo-contacts";

export default function Index() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const { next, hasError, hasNext } = useExportContactsInBatches();

  const handleButtonPress = async () => {
    const newContacts = (await next()).data || [];
    setContacts((prevContacts) => [...newContacts, ...prevContacts]);
  };

  return (
    <>
      <View>
        <Text>Has Next: {hasNext ? "Yes" : "No"}</Text>
        <Text>Has Error: {hasError ? "Yes" : "No"}</Text>

        <Button title="Next" onPress={handleButtonPress} />
        {contacts.map((contact) => (
          <Text key={contact.id}>{contact.name}</Text>
        ))}
      </View>
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text>Edit app/index.tsx to edit this screen.</Text>
      </View>
    </>
  );
}
