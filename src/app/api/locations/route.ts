import { NextResponse } from "next/server";

// Rwanda administrative divisions data
const RWANDA_LOCATIONS = {
  provinces: [
    {
      name: "Kigali City",
      districts: [
        {
          name: "Gasabo",
          sectors: [
            {
              name: "Remera",
              cells: ["Nyabisindu", "Rukiri I", "Rukiri II", "Nyarugunga"],
              villages: ["Isangano", "Amahoro", "Kagugu", "Kimironko", "Nyarutarama"]
            },
            {
              name: "Kimironko",
              cells: ["Bibare", "Kibagabaga", "Kinyana"],
              villages: ["Kibagabaga", "Kimironko", "Gacuriro", "Kimihurura"]
            },
            {
              name: "Kacyiru",
              cells: ["Kamatamu", "Kacyiru", "Kamutwa"],
              villages: ["Kacyiru", "Kimihurura", "Nyarutarama", "Rebero"]
            },
            {
              name: "Gikomero",
              cells: ["Cyambwe", "Gasharu", "Gashenyi"],
              villages: ["Gikomero", "Murambi", "Nyamabuye"]
            }
          ]
        },
        {
          name: "Kicukiro",
          sectors: [
            {
              name: "Gahanga",
              cells: ["Gahanga", "Buterere", "Karembure"],
              villages: ["Gahanga", "Karembure", "Kigarama"]
            },
            {
              name: "Niboye",
              cells: ["Niboye", "Munini", "Karama"],
              villages: ["Niboye", "Karama", "Kimisagara"]
            },
            {
              name: "Kanombe",
              cells: ["Gatare", "Nyarugunga", "Kabuye"],
              villages: ["Kanombe", "Kabuye", "Rebero"]
            }
          ]
        },
        {
          name: "Nyarugenge",
          sectors: [
            {
              name: "Nyarugenge",
              cells: ["Ubumwe", "Cyivugiza", "Rwezamenyo"],
              villages: ["Nyarugenge", "Rwezamenyo", "Muhima"]
            },
            {
              name: "Muhima",
              cells: ["Amahoro", "Rugenge", "Gitega"],
              villages: ["Muhima", "Nyamirambo", "Nyabugogo"]
            },
            {
              name: "Nyamirambo",
              cells: ["Nyamirambo", "Nyakabanda", "Biryogo"],
              villages: ["Nyamirambo", "Nyakabanda", "Nyabugogo"]
            }
          ]
        }
      ]
    },
    {
      name: "Eastern Province",
      districts: [
        {
          name: "Rwamagana",
          sectors: [
            {
              name: "Mwulire",
              cells: ["Mwulire", "Nyakariro", "Rebero"],
              villages: ["Mwulire", "Nyakariro", "Kigabiro"]
            },
            {
              name: "Gahengeri",
              cells: ["Gahengeri", "Kajevuba", "Rugarama"],
              villages: ["Gahengeri", "Kajevuba", "Rugarama"]
            }
          ]
        },
        {
          name: "Kayonza",
          sectors: [
            {
              name: "Kabare",
              cells: ["Kabare", "Rukara", "Nyamirama"],
              villages: ["Kabare", "Rukara", "Nyamirama"]
            },
            {
              name: "Rwinkwavu",
              cells: ["Rwinkwavu", "Nyarubuye", "Gahini"],
              villages: ["Rwinkwavu", "Nyarubuye", "Gahini"]
            }
          ]
        },
        {
          name: "Bugesera",
          sectors: [
            {
              name: "Nyamata",
              cells: ["Kayenzi", "Kamabuye", "Nyamata"],
              villages: ["Nyamata", "Kamabuye", "Kayenzi"]
            },
            {
              name: "Rilima",
              cells: ["Rilima", "Nyarusange", "Ruhuha"],
              villages: ["Rilima", "Nyarusange", "Ruhuha"]
            }
          ]
        }
      ]
    },
    {
      name: "Southern Province",
      districts: [
        {
          name: "Huye",
          sectors: [
            {
              name: "Huye",
              cells: ["Matyazo", "Tumba", "Ngoma"],
              villages: ["Huye", "Tumba", "Ngoma"]
            },
            {
              name: "Ngoma",
              cells: ["Ngoma", "Cyarwa", "Maraba"],
              villages: ["Ngoma", "Cyarwa", "Maraba"]
            }
          ]
        },
        {
          name: "Muhanga",
          sectors: [
            {
              name: "Muhanga",
              cells: ["Cyeza", "Kabacuzi", "Nyamabuye"],
              villages: ["Muhanga", "Cyeza", "Kabacuzi"]
            },
            {
              name: "Nyamabuye",
              cells: ["Nyamabuye", "Rugendabari", "Mushishiro"],
              villages: ["Nyamabuye", "Rugendabari", "Mushishiro"]
            }
          ]
        }
      ]
    },
    {
      name: "Western Province",
      districts: [
        {
          name: "Rusizi",
          sectors: [
            {
              name: "Kamembe",
              cells: ["Kamembe", "Gatandara", "Nkanka"],
              villages: ["Kamembe", "Gatandara", "Nkanka"]
            },
            {
              name: "Nkanka",
              cells: ["Nkanka", "Bugarama", "Gihundwe"],
              villages: ["Nkanka", "Bugarama", "Gihundwe"]
            }
          ]
        },
        {
          name: "Rubavu",
          sectors: [
            {
              name: "Gisenyi",
              cells: ["Rubavu", "Umuganda", "Gisenyi"],
              villages: ["Gisenyi", "Rubavu", "Umuganda"]
            },
            {
              name: "Rugerero",
              cells: ["Rugerero", "Nyundo", "Mudende"],
              villages: ["Rugerero", "Nyundo", "Mudende"]
            }
          ]
        }
      ]
    },
    {
      name: "Northern Province",
      districts: [
        {
          name: "Musanze",
          sectors: [
            {
              name: "Musanze",
              cells: ["Muhoza", "Cyuve", "Kabeza"],
              villages: ["Musanze", "Muhoza", "Cyuve"]
            },
            {
              name: "Muhoza",
              cells: ["Muhoza", "Rwaza", "Cyuve"],
              villages: ["Muhoza", "Rwaza", "Cyuve"]
            }
          ]
        },
        {
          name: "Gicumbi",
          sectors: [
            {
              name: "Byumba",
              cells: ["Byumba", "Kageyo", "Kinyababa"],
              villages: ["Byumba", "Kageyo", "Kinyababa"]
            },
            {
              name: "Kaniga",
              cells: ["Kaniga", "Rukomo", "Cyumba"],
              villages: ["Kaniga", "Rukomo", "Cyumba"]
            }
          ]
        }
      ]
    }
  ]
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const level = searchParams.get('level'); // province, district, sector, cell, village
    const province = searchParams.get('province');
    const district = searchParams.get('district');
    const sector = searchParams.get('sector');
    const cell = searchParams.get('cell');

    // Return all provinces
    if (!level || level === 'provinces') {
      return NextResponse.json({
        provinces: RWANDA_LOCATIONS.provinces.map(p => p.name)
      });
    }

    // Return districts for a province
    if (level === 'districts' && province) {
      const provinceData = RWANDA_LOCATIONS.provinces.find(p => p.name === province);
      if (!provinceData) {
        return NextResponse.json({ error: 'Province not found' }, { status: 404 });
      }
      return NextResponse.json({
        districts: provinceData.districts.map(d => d.name)
      });
    }

    // Return sectors for a district
    if (level === 'sectors' && province && district) {
      const provinceData = RWANDA_LOCATIONS.provinces.find(p => p.name === province);
      if (!provinceData) {
        return NextResponse.json({ error: 'Province not found' }, { status: 404 });
      }
      const districtData = provinceData.districts.find(d => d.name === district);
      if (!districtData) {
        return NextResponse.json({ error: 'District not found' }, { status: 404 });
      }
      return NextResponse.json({
        sectors: districtData.sectors.map(s => s.name)
      });
    }

    // Return cells for a sector
    if (level === 'cells' && province && district && sector) {
      const provinceData = RWANDA_LOCATIONS.provinces.find(p => p.name === province);
      if (!provinceData) {
        return NextResponse.json({ error: 'Province not found' }, { status: 404 });
      }
      const districtData = provinceData.districts.find(d => d.name === district);
      if (!districtData) {
        return NextResponse.json({ error: 'District not found' }, { status: 404 });
      }
      const sectorData = districtData.sectors.find(s => s.name === sector);
      if (!sectorData) {
        return NextResponse.json({ error: 'Sector not found' }, { status: 404 });
      }
      return NextResponse.json({
        cells: sectorData.cells
      });
    }

    // Return villages for a cell
    if (level === 'villages' && province && district && sector && cell) {
      const provinceData = RWANDA_LOCATIONS.provinces.find(p => p.name === province);
      if (!provinceData) {
        return NextResponse.json({ error: 'Province not found' }, { status: 404 });
      }
      const districtData = provinceData.districts.find(d => d.name === district);
      if (!districtData) {
        return NextResponse.json({ error: 'District not found' }, { status: 404 });
      }
      const sectorData = districtData.sectors.find(s => s.name === sector);
      if (!sectorData) {
        return NextResponse.json({ error: 'Sector not found' }, { status: 404 });
      }
      return NextResponse.json({
        villages: sectorData.villages
      });
    }

    return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 });
  } catch (error) {
    console.error("GET locations error:", error);
    return NextResponse.json({ error: "Failed to fetch locations" }, { status: 500 });
  }
}
