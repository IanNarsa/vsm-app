export const vsmDummyData = {
  id: "root",
  name: "High-Level Flow",
  processes: [
    {
      id: "p1",
      name: "Raw Material",
      isVA: false,
      ct: 10,
      wt: 15,
      hasChildren: false
    },
    {
      id: "p2",
      name: "Production",
      isVA: true,
      ct: 135,
      wt: 25,
      hasChildren: true,
      children: {
        id: "p2-detail",
        name: "Production Detailed Flow",
        processes: [
          { id: "p2-1", name: "Cutting", isVA: true, ct: 30, wt: 5, hasChildren: false },
          { id: "p2-2", name: "Assembly", isVA: true, ct: 40, wt: 5, hasChildren: false },
          { id: "p2-3", name: "Painting", isVA: true, ct: 50, wt: 10, hasChildren: false },
          { id: "p2-4", name: "Inspection", isVA: false, ct: 15, wt: 5, hasChildren: false }
        ]
      }
    },
    {
      id: "p3",
      name: "QA",
      isVA: false,
      ct: 20,
      wt: 10,
      hasChildren: false
    },
    {
      id: "p4",
      name: "Delivery",
      isVA: false,
      ct: 60,
      wt: 12,
      hasChildren: false
    }
  ]
};
