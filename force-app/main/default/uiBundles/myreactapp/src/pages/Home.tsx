import { useEffect, useState } from 'react';
import { createDataSDK } from '@salesforce/sdk-data';

const QUERY = `
  query GetContact {
    uiapi {
      query {
        Contact(first: 1) {
          edges {
            node {
              Id
              Name { value }
              Title { value }
            }
          }
        }
      }
    }
  }
`;

interface ContactData {
  id?: string;
  name?: string;
  title?: string;
}

export default function Home() {
  const [contact, setContact] = useState<ContactData | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const sdk = await createDataSDK();
        
        if (sdk?.graphql) {
          const response: any = await sdk.graphql({ query: QUERY });
          console.log("GraphQL Full Response:", response);

          if (response?.errors && response.errors.length > 0) {
            setErrorMsg(response.errors[0].message);
            return;
          }

          const record = response?.data?.uiapi?.query?.Contact?.edges?.[0]?.node;
          
          if (record) {
            setContact({
              id: record.Id,
              name: record.Name?.value,
              title: record.Title?.value || 'No Title Provided'
            });
          } else {
            setErrorMsg("No Contact records found in this org.");
          }
        }
      } catch (err: any) {
        console.error("SDK Execution Error:", err);
        setErrorMsg(err?.message || "Failed to query Salesforce SDK.");
      }
    };
    
    fetchData();
  }, []);

  if (errorMsg) {
    return <p style={{ padding: '1rem', color: 'red' }}>Error: {errorMsg}</p>;
  }

  if (!contact) {
    return <p style={{ padding: '1rem' }}>Loading contact...</p>;
  }

  return (
    <div style={{ border: '1px solid #ccc', padding: '1rem', margin: '1rem', borderRadius: '8px' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{contact.name}</h1>
      <p>{contact.title}</p>
    </div>
  );
}